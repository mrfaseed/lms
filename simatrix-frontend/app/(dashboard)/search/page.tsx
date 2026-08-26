import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SearchView from './SearchView';

async function getSearchResults(query: string) {
  if (!query) return null;
  
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    redirect('/login');
  }

  const res = await fetch(`http://127.0.0.1:8000/search/api/?q=${encodeURIComponent(query)}`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch search results');
  }

  return res.json();
}

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>
}) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || '';
  const results = await getSearchResults(query);

  return <SearchView query={query} initialResults={results} />;
}
