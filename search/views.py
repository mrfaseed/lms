from itertools import chain
from django.views.generic import ListView
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from core.models import NewsAndEvents
from course.models import Program, Course
from quiz.models import Quiz


class SearchAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        query = request.GET.get("q", "")
        
        if not query:
            return JsonResponse({"courses": [], "quizzes": [], "news": []})

        news_events_results = NewsAndEvents.objects.search(query)
        course_results = Course.objects.search(query)
        quiz_results = Quiz.objects.search(query)

        # Serialize
        courses_data = [
            {"id": c.id, "title": c.title, "slug": c.slug, "code": c.code, "summary": c.summary}
            for c in course_results
        ]
        quizzes_data = [
            {"id": q.id, "title": q.title, "slug": q.slug, "description": q.description}
            for q in quiz_results
        ]
        news_data = [
            {"id": n.id, "title": n.title, "summary": n.summary, "type": n.posted_as}
            for n in news_events_results
        ]

        return JsonResponse({
            "query": query,
            "courses": courses_data,
            "quizzes": quizzes_data,
            "news": news_data
        })

class SearchView(ListView):
    template_name = "search/search_view.html"
    paginate_by = 20
    count = 0

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)
        context["count"] = self.count or 0
        context["query"] = self.request.GET.get("q")
        return context

    def get_queryset(self):
        request = self.request
        query = request.GET.get("q", None)

        if query is not None:
            news_events_results = NewsAndEvents.objects.search(query)
            program_results = Program.objects.search(query)
            course_results = Course.objects.search(query)
            quiz_results = Quiz.objects.search(query)

            # combine querysets
            queryset_chain = chain(
                news_events_results, program_results, course_results, quiz_results
            )
            queryset = sorted(
                queryset_chain, key=lambda instance: instance.pk, reverse=True
            )
            self.count = len(queryset)  # since queryset is actually a list
            return queryset
        return NewsAndEvents.objects.none()  # just an empty queryset as default
