import {Link} from 'react-router-dom';
import React, {useState, useEffect} from 'react';
import {PageWire, PageStatus} from '@gustav/types';

import {pageSdk} from '../sdk';

export function AdminPages() {
  const [pages, setPages] = useState<PageWire[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<Partial<PageWire> | null>(
    null
  );
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    parentId: undefined as number | undefined,
    showInNavigation: true,
  });

  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [pageVersions, setPageVersions] = useState<PageWire[]>([]);
  const [selectedPageForVersions, setSelectedPageForVersions] =
    useState<PageWire | null>(null);

  const fetchVersions = async (page: PageWire) => {
    try {
      setSelectedPageForVersions(page);
      const data = await pageSdk.findVersions(page.id);
      setPageVersions(data);
      setShowVersionsModal(true);
    } catch {
      alert('Failed to fetch versions');
    }
  };

  const handleRevert = async (version: PageWire) => {
    if (!selectedPageForVersions) return;
    if (
      !confirm(
        `Are you sure you want to revert to Version ${version.versionNumber}? This will create a new draft from this version.`
      )
    )
      return;

    try {
      await pageSdk.revert(selectedPageForVersions.id, version.versionId!);
      setShowVersionsModal(false);
      fetchPages();
    } catch (err) {
      alert('Failed to revert');
    }
  };

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
        showInNavigation: page.showInNavigation ?? true,
      });
    } else {
      setEditingPage(null);
      setFormData({
        title: '',
        slug: '',
        parentId: undefined,
        showInNavigation: true,
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
    if (
      !confirm(
        'Are you sure you want to delete this page? This will also delete all subpages and components.'
      )
    )
      return;
    try {
      await pageSdk.removePage(id);
      fetchPages();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete page');
    }
  };

  // Helper to render hierarchical list
  const renderPageRows = (
    parentId: number | null | undefined = null,
    level = 0
  ) => {
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
                style={{marginLeft: `${level * 2}rem`}}
              >
                {level > 0 && (
                  <svg
                    className="w-4 h-4 text-gray-300 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center font-bold text-xs">
                  {page.path === '/' ? 'H' : 'P'}
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <div className="font-bold text-gray-900 dark:text-white">
                    {page.title}
                  </div>
                  {!page.showInNavigation && (
                    <span
                      title="Hidden from navigation"
                      className="text-gray-400"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 font-medium font-mono">
                  {page.path}
                </div>
              </div>
            </div>
          </td>
          <td className="py-5 px-8">
            <div className="flex flex-col space-y-1">
              <span
                className={`inline-flex items-center self-start text-[10px] font-black uppercase px-2 py-1 rounded-md border ${
                  page.status === PageStatus.PUBLISHED
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : page.status === PageStatus.ARCHIVED
                      ? 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }`}
              >
                {page.status}
              </span>
              {page.hasDraft && page.status === PageStatus.PUBLISHED && (
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter">
                  Unpublished Changes
                </span>
              )}
            </div>
          </td>
          <td className="py-5 px-8 text-right">
            <div className="flex items-center justify-end space-x-1">
              <a
                href={page.path}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
                title="View Page"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
              {page.status !== PageStatus.PUBLISHED || page.hasDraft ? (
                <button
                  onClick={async () => {
                    try {
                      await pageSdk.update(page.id, {
                        status: PageStatus.PUBLISHED,
                      });
                      fetchPages();
                    } catch {
                      alert('Failed to publish');
                    }
                  }}
                  className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                  title="Publish Changes"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </button>
              ) : null}
              <button
                onClick={() => fetchVersions(page)}
                className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
                title="Version History"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
              <Link
                to={`/admin/pages/${page.id}`}
                className="p-2 text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-all"
                title="Edit Components"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </Link>
              <button
                onClick={() => handleOpenModal(page)}
                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
                title="Page Settings"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(page.id)}
                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                title="Delete Page"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
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
                <td
                  colSpan={3}
                  className="py-12 text-center text-gray-400 font-medium"
                >
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
                    setFormData({
                      ...formData,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                    })
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
                    setFormData({
                      ...formData,
                      parentId: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
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
              <div className="flex items-center space-x-3 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-100 dark:border-zinc-800">
                <input
                  type="checkbox"
                  id="showInNavigation"
                  checked={formData.showInNavigation}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      showInNavigation: e.target.checked,
                    })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="showInNavigation"
                  className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Show in navigation menu
                </label>
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

      {showVersionsModal && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black dark:text-white tracking-tight">
                  Version History
                </h3>
                <p className="text-sm text-gray-400 font-medium">
                  {selectedPageForVersions?.title} •{' '}
                  {selectedPageForVersions?.path}
                </p>
              </div>
              <button
                onClick={() => setShowVersionsModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl text-gray-400 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-3">
                {pageVersions.map(v => (
                  <div
                    key={v.versionId}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-800"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-xl flex items-center justify-center font-black text-xs border border-gray-100 dark:border-zinc-800">
                        v{v.versionNumber}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {v.title}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
                              v.status === PageStatus.PUBLISHED
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : v.status === PageStatus.DRAFT
                                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                  : 'bg-gray-500/10 text-gray-600 border-gray-500/20'
                            }`}
                          >
                            {v.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium">
                          {new Date(v.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {v.status === PageStatus.ARCHIVED && (
                        <button
                          onClick={() => handleRevert(v)}
                          className="px-4 py-2 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white text-[10px] font-black uppercase rounded-lg shadow-md hover:scale-105 active:scale-95 transition-all"
                        >
                          Revert to this
                        </button>
                      )}
                      {v.status === PageStatus.PUBLISHED && (
                        <span className="text-[10px] font-black text-emerald-500 uppercase px-3">
                          Current Live
                        </span>
                      )}
                      {v.status === PageStatus.DRAFT && (
                        <span className="text-[10px] font-black text-amber-500 uppercase px-3">
                          Working Draft
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
