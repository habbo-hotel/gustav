import React, {useState, useEffect} from 'react';
import {PageWire, PageStatus} from '@gustav/types';
import {Link} from 'react-router-dom';

import {pageSdk} from '../sdk';

export function AdminPages() {
  const [pages, setPages] = useState<PageWire[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<Partial<PageWire> | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    parentId: undefined as number | undefined,
    status: PageStatus.DRAFT,
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const data = await pageSdk.findAll();
      setPages(data);
    } catch {
      // Error handled by SDK
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (page?: PageWire) => {
    if (page) {
      setEditingPage(page);
      setFormData({
        title: page.title,
        slug: page.slug,
        parentId: page.parentId,
        status: page.status,
      });
    } else {
      setEditingPage(null);
      setFormData({
        title: '',
        slug: '',
        parentId: undefined,
        status: PageStatus.DRAFT,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPage?.id) {
        await pageSdk.update(editingPage.id, formData);
      } else {
        await pageSdk.create(formData);
      }
      setShowModal(false);
      fetchPages();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save page');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this page? This will also delete all subpages and components.')) return;
    try {
      await pageSdk.removePage(id);
      fetchPages();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete page');
    }
  };

  // Helper to render hierarchical list
  const renderPageRows = (parentId: number | null | undefined = null, level = 0) => {
    const levelPages = pages.filter(p => {
      if (parentId === null || parentId === undefined) {
        return p.parentId === null || p.parentId === undefined;
      }
      return p.parentId === parentId;
    });
    
    return levelPages.map(page => (
      <React.Fragment key={page.id}>
        <tr className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/10 transition-colors">
          <td className="py-5 px-8">
            <div className="flex items-center space-x-4">
              <div 
                className="flex items-center"
                style={{ marginLeft: `${level * 2}rem` }}
              >
                {level > 0 && (
                  <svg className="w-4 h-4 text-gray-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                )}
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center font-bold text-xs">
                  {page.path === '/' ? 'H' : 'P'}
                </div>
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-white">
                  {page.title}
                </div>
                <div className="text-xs text-gray-400 font-medium font-mono">
                  {page.path}
                </div>
              </div>
            </div>
          </td>
          <td className="py-5 px-8">
            <span className={`inline-flex items-center text-[10px] font-black uppercase px-2 py-1 rounded-md border ${
              page.status === PageStatus.PUBLISHED 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}>
              {page.status}
            </span>
          </td>
          <td className="py-5 px-8 text-right">
            <div className="flex items-center justify-end space-x-1">
              <Link
                to={`/admin/pages/${page.id}`}
                className="p-2 text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-all"
                title="Edit Components"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
              <button
                onClick={() => handleOpenModal(page)}
                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
                title="Page Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(page.id)}
                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                title="Delete Page"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
        {renderPageRows(page.id, level + 1)}
      </React.Fragment>
    ));
  };

  if (loading && pages.length === 0)
    return (
      <div className="text-gray-500 animate-pulse font-bold">
        Loading pages...
      </div>
    );

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            CMS Pages
          </h2>
          <p className="text-sm text-gray-400 font-medium">
            Design and publish hierarchical content
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white text-sm font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-zinc-950/20 active:scale-95"
        >
          Create Page
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-zinc-800/20">
              <th className="py-4 px-8 font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                Structure & Path
              </th>
              <th className="py-4 px-8 font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                Status
              </th>
              <th className="py-4 px-8 font-bold text-gray-400 uppercase tracking-wider text-[10px] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
            {pages.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-12 text-center text-gray-400 font-medium">
                  No pages found. Create your first page to get started.
                </td>
              </tr>
            ) : (
              renderPageRows()
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black mb-1 dark:text-white tracking-tight">
              {editingPage ? 'Page Settings' : 'Create New Page'}
            </h3>
            <p className="text-sm text-gray-400 font-medium mb-6">
              Configure page metadata and routing
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. About Us"
                  value={formData.title}
                  onChange={e =>
                    setFormData({...formData, title: e.target.value})
                  }
                  className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                  Slug
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. about-us"
                  value={formData.slug}
                  onChange={e =>
                    setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})
                  }
                  className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                  Parent Page
                </label>
                <select
                  value={formData.parentId || ''}
                  onChange={e =>
                    setFormData({...formData, parentId: e.target.value ? parseInt(e.target.value) : undefined})
                  }
                  className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all appearance-none"
                >
                  <option value="">None (Root Level)</option>
                  {pages
                    .filter(p => p.id !== editingPage?.id) // Prevent self-parenting
                    .map(p => (
                      <option key={p.id} value={p.id}>
                        {p.path}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, status: PageStatus.DRAFT})}
                    className={`py-3 rounded-xl text-xs font-black uppercase border transition-all ${
                      formData.status === PageStatus.DRAFT
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-600'
                        : 'bg-gray-50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-800 text-gray-400'
                    }`}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, status: PageStatus.PUBLISHED})}
                    className={`py-3 rounded-xl text-xs font-black uppercase border transition-all ${
                      formData.status === PageStatus.PUBLISHED
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600'
                        : 'bg-gray-50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-800 text-gray-400'
                    }`}
                  >
                    Published
                  </button>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 font-bold py-3 rounded-xl transition-all hover:bg-gray-200 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white font-bold py-3 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  {editingPage ? 'Save Changes' : 'Create Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
