import toast from 'react-hot-toast';
import {Link} from 'react-router-dom';
import React, {useState, useEffect} from 'react';
import {PageWire, PageStatus} from '@gustav/types';
import {pageSdk} from '../sdk';
import {Card, CardBody} from '../ui/Card';
import {Button} from '../ui/Button';
import {Badge} from '../ui/Badge';
import {Modal} from '../ui/Modal';
import {Input, Select} from '../ui/Input';

export function AdminPages() {
  const [pages, setPages] = useState<PageWire[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState<Partial<PageWire> | null>(null);
  const [formData, setFormData] = useState({title: '', slug: '', parentId: undefined as number | undefined, showInNavigation: true});
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [pageVersions, setPageVersions] = useState<PageWire[]>([]);
  const [selectedPageForVersions, setSelectedPageForVersions] = useState<PageWire | null>(null);

  const fetchVersions = async (page: PageWire) => {
    try { setSelectedPageForVersions(page); const data = await pageSdk.findVersions(page.id); setPageVersions(data); setShowVersionsModal(true); }
    catch { toast.error('Failed to fetch versions'); }
  };

  const handleRevert = async (version: PageWire) => {
    if (!selectedPageForVersions) return;
    try { await pageSdk.revert(selectedPageForVersions.id, version.versionId!); setShowVersionsModal(false); fetchPages(); toast.success(`Reverted to version ${version.versionNumber}`); }
    catch { toast.error('Failed to revert'); }
  };

  useEffect(() => { document.title = 'Gustav - Pages'; fetchPages(); }, []);

  const fetchPages = async () => { try { setLoading(true); const data = await pageSdk.findAll(); setPages(data); } catch {} finally { setLoading(false); } };

  const handleOpenModal = (page?: PageWire) => {
    if (page) { setEditingPage(page); setFormData({title: page.title, slug: page.slug, parentId: page.parentId, showInNavigation: page.showInNavigation ?? true}); }
    else { setEditingPage(null); setFormData({title: '', slug: '', parentId: undefined, showInNavigation: true}); }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPage?.id) { await pageSdk.update(editingPage.id, formData); toast.success('Page updated'); }
      else { await pageSdk.create(formData); toast.success('Page created'); }
      setShowModal(false); fetchPages();
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to save page'); }
  };

  const handleDelete = async (id: number) => { try { await pageSdk.removePage(id); fetchPages(); toast.success('Page deleted'); } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to delete page'); } };

  const renderPageCards = (parentId: number | null | undefined = null, level = 0) => {
    const levelPages = pages.filter(p => parentId === null || parentId === undefined ? (p.parentId === null || p.parentId === undefined) : p.parentId === parentId);
    return levelPages.map(page => (
      <React.Fragment key={page.id}>
        <Card hover className={level > 0 ? 'ml-8' : ''}>
          <CardBody className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${page.path === '/' ? 'bg-warning-light text-warning border border-warning/20' : 'bg-layer-primary-light text-layer-primary border border-layer-primary/20'}`}>
                {page.path === '/' ? 'H' : 'P'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text dark:text-white">{page.title}</span>
                  {!page.showInNavigation && <svg className="w-3 h-3 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono font-medium text-text-secondary dark:text-dark-text-secondary">{page.path}</span>
                  {page.hasDraft && page.status === PageStatus.PUBLISHED && <span className="text-[0.5625rem] font-bold text-warning uppercase">Unpublished Changes</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {page.status === PageStatus.PUBLISHED ? <Badge variant="published" dot>{page.status}</Badge> : page.status === PageStatus.ARCHIVED ? <Badge variant="archived">{page.status}</Badge> : <Badge variant="draft">{page.status}</Badge>}
              <Button variant="secondary" size="sm" icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>} onClick={() => window.open(page.path, '_blank')}>View</Button>
              {(page.status !== PageStatus.PUBLISHED || page.hasDraft) && (
                <Button variant="success" size="sm" icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                  onClick={async () => { try { await pageSdk.update(page.id, {status: PageStatus.PUBLISHED}); fetchPages(); toast.success('Page published'); } catch { toast.error('Failed to publish'); } }}
                >Publish</Button>
              )}
              <Button variant="secondary" size="sm" icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} onClick={() => fetchVersions(page)}>History</Button>
              <Link to={`/admin/pages/${page.id}`}><Button variant="primary" size="sm" icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}>Edit</Button></Link>
              <Button variant="secondary" size="sm" icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} onClick={() => handleOpenModal(page)}>Settings</Button>
              <Button variant="danger" size="sm" icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>} onClick={() => handleDelete(page.id)}>Delete</Button>
            </div>
          </CardBody>
        </Card>
        {renderPageCards(page.id, level + 1)}
      </React.Fragment>
    ));
  };

  if (loading && pages.length === 0) return <div className="flex items-center gap-3 text-text-secondary font-bold text-sm p-8"><div className="w-5 h-5 border-2 border-layer-primary border-t-transparent rounded-full animate-spin" />Loading pages...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="layer-title text-2xl text-text dark:text-white">Pages</h1>
          <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mt-1">Design and publish hierarchical content</p>
        </div>
        <Button icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>} onClick={() => handleOpenModal()}>Create Page</Button>
      </div>
      <div className="space-y-3">
        {pages.length === 0 ? <Card><CardBody><p className="text-center text-text-secondary font-bold py-8">No pages found. Create your first page to get started.</p></CardBody></Card> : renderPageCards()}
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingPage ? 'Page Settings' : 'Create Page'} subtitle="Configure page metadata and routing" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" form="page-form">{editingPage ? 'Save Changes' : 'Create Page'}</Button></>}
      >
        <form id="page-form" onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" required placeholder="e.g. About Us" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          <Input label="Slug" required placeholder="e.g. about-us" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} />
          <Select label="Parent Page" value={formData.parentId || ''} onChange={e => setFormData({...formData, parentId: e.target.value ? parseInt(e.target.value) : undefined})}>
            <option value="">None (Root Level)</option>
            {pages.filter(p => p.id !== editingPage?.id).map(p => <option key={p.id} value={p.id}>{p.path}</option>)}
          </Select>
          <label className="flex items-center gap-3 p-3 bg-l1-bg dark:bg-dark-surface border border-l5-border dark:border-dark-border rounded-lg cursor-pointer">
            <input type="checkbox" checked={formData.showInNavigation} onChange={e => setFormData({...formData, showInNavigation: e.target.checked})} className="w-4 h-4 rounded border-l5-border text-layer-primary focus:ring-layer-primary/30" />
            <span className="text-xs font-bold text-text dark:text-dark-text uppercase tracking-tight">Show in navigation menu</span>
          </label>
        </form>
      </Modal>
      <Modal open={showVersionsModal} onClose={() => setShowVersionsModal(false)} title="Version History" subtitle={selectedPageForVersions ? `${selectedPageForVersions.title} • ${selectedPageForVersions.path}` : undefined} size="lg">
        <div className="space-y-3">
          {pageVersions.map(v => (
            <div key={v.versionId} className="flex items-center justify-between p-4 bg-l1-bg dark:bg-dark-surface border border-l5-border dark:border-dark-border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white dark:bg-dark-card border border-l5-border dark:border-dark-border rounded-lg flex items-center justify-center font-black text-xs text-text-secondary dark:text-dark-text-secondary">v{v.versionNumber}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text dark:text-white">{v.title}</span>
                    {v.status === PageStatus.PUBLISHED ? <Badge variant="published">{v.status}</Badge> : v.status === PageStatus.ARCHIVED ? <Badge variant="archived">{v.status}</Badge> : <Badge variant="draft">{v.status}</Badge>}
                  </div>
                  <div className="text-[0.625rem] font-medium text-text-secondary dark:text-dark-text-secondary mt-0.5">{new Date(v.updatedAt).toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {v.status === PageStatus.ARCHIVED && <Button size="sm" onClick={() => handleRevert(v)}>Revert</Button>}
                {v.status === PageStatus.PUBLISHED && <span className="text-[0.625rem] font-bold text-success uppercase">Current Live</span>}
                {v.status === PageStatus.DRAFT && <span className="text-[0.625rem] font-bold text-warning uppercase">Working Draft</span>}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
