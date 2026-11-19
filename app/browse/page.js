import { Suspense } from 'react';
import BrowseExplorer from '../../components/browse/BrowseExplorer';
import { PageLoading } from '../../components/ui/Loading';
export const metadata = { title: 'Browse Lost & Found Reports' };
export default function BrowsePage() { return <Suspense fallback={<PageLoading label="Loading community reports…" />}><BrowseExplorer /></Suspense>; }
