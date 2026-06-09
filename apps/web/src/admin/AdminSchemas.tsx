import toast from 'react-hot-toast';
import React, {useEffect, useMemo, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {DynamicRecordWire, DynamicSchemaField, DynamicSchemaFieldType, DynamicSchemaInput, DynamicSchemaWire} from '@gustav/types';
import {schemaSdk} from '../sdk';
import {Card, CardBody} from '../ui/Card';
import {Button} from '../ui/Button';
import {Badge} from '../ui/Badge';
import {Modal} from '../ui/Modal';
import {Input, Select, Textarea} from '../ui/Input';

const fieldTypes: DynamicSchemaFieldType[] = ['text', 'textarea', 'number', 'checkbox', 'date', 'select'];
const emptyField = (): DynamicSchemaField => ({name: '', label: '', type: 'text', required: false});
const emptySchemaForm = (): DynamicSchemaInput => ({name: '', slug: '', description: '', fields: [emptyField()]});

export function AdminSchemas() {
  const {slug} = useParams();
  const navigate = useNavigate();
  const [schemas, setSchemas] = useState<DynamicSchemaWire[]>([]);
  const [records, setRecords] = useState<DynamicRecordWire[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editingSchema, setEditingSchema] = useState<DynamicSchemaWire | null>(null);
  const [editingRecord, setEditingRecord] = useState<DynamicRecordWire | null>(null);
  const [schemaForm, setSchemaForm] = useState<DynamicSchemaInput>(emptySchemaForm());
  const [recordForm, setRecordForm] = useState<Record<string, unknown>>({});

  const selectedSchema = useMemo(() => schemas.find(s => s.slug === slug) || null, [schemas, slug]);

  useEffect(() => { document.title = 'Gustav - Schemas'; fetchSchemas(); }, []);
  useEffect(() => { if (selectedSchema) fetchRecords(selectedSchema.slug); else setRecords([]); }, [selectedSchema?.slug]);

  const fetchSchemas = async () => { try { setLoading(true); const data = await schemaSdk.findAll(); setSchemas(data); } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to load schemas'); } finally { setLoading(false); } };
  const fetchRecords = async (schemaSlug: string) => { try { setRecordsLoading(true); const data = await schemaSdk.findRecords(schemaSlug); setRecords(data); } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to load records'); } finally { setRecordsLoading(false); } };

  const openSchemaModal = (schema?: DynamicSchemaWire) => {
    setEditingSchema(schema || null);
    setSchemaForm(schema ? {name: schema.name, slug: schema.slug, description: schema.description || '', fields: schema.fields.length ? schema.fields : [emptyField()]} : emptySchemaForm());
    setShowSchemaModal(true);
  };

  const openRecordModal = (record?: DynamicRecordWire) => {
    if (!selectedSchema) return;
    setEditingRecord(record || null);
    const nextData: Record<string, unknown> = {};
    selectedSchema.fields.forEach(field => { nextData[field.name] = record?.data?.[field.name] ?? (field.type === 'checkbox' ? false : ''); });
    setRecordForm(nextData);
    setShowRecordModal(true);
  };

  const saveSchema = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {...schemaForm, slug: normalizeSlug(schemaForm.slug || schemaForm.name), fields: schemaForm.fields.map(f => ({...f, name: normalizeFieldName(f.name || f.label)}))};
      const saved = editingSchema ? await schemaSdk.update(editingSchema.slug, payload) : await schemaSdk.create(payload);
      setShowSchemaModal(false); await fetchSchemas(); navigate(`/admin/schemas/${saved.slug}`);
      toast.success(editingSchema ? 'Schema updated' : 'Schema created');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to save schema'); }
  };

  const deleteSchema = async (schema: DynamicSchemaWire) => {
    try {
      const check = await schemaSdk.checkDelete(schema.slug);
      if (!check.canDelete) {
        const summary = check.dependencies.map(d => `${d.count} ${d.label}`).join(', ');
        if (!window.confirm(`Schema "${schema.name}" has dependencies: ${summary}. Delete ${check.dependencyCount} dependencies too?`)) return;
        await schemaSdk.removeSchema(schema.slug, true);
      } else {
        if (!window.confirm(`Delete schema "${schema.name}"?`)) return;
        await schemaSdk.removeSchema(schema.slug);
      }
      toast.success('Schema deleted'); await fetchSchemas(); navigate('/admin/schemas');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to delete schema'); }
  };

  const saveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchema) return;
    try {
      if (editingRecord) { await schemaSdk.updateRecord(selectedSchema.slug, editingRecord.id, {data: recordForm}); toast.success('Record updated'); }
      else { await schemaSdk.createRecord(selectedSchema.slug, {data: recordForm}); toast.success('Record created'); }
      setShowRecordModal(false); fetchRecords(selectedSchema.slug); fetchSchemas();
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to save record'); }
  };

  const deleteRecord = async (record: DynamicRecordWire) => {
    if (!selectedSchema) return;
    if (!window.confirm('Delete this record?')) return;
    try { await schemaSdk.removeRecord(selectedSchema.slug, record.id); toast.success('Record deleted'); fetchRecords(selectedSchema.slug); fetchSchemas(); }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to delete record'); }
  };

  const updateField = (index: number, updates: Partial<DynamicSchemaField>) => setSchemaForm(f => ({...f, fields: f.fields.map((field, i) => i === index ? {...field, ...updates} : field)}));

  const groupedNavSchemas = useMemo(() => schemas.reduce((acc, s) => { const folder = s.folder || 'Uncategorized'; (acc[folder] ||= []).push(s); return acc; }, {} as Record<string, DynamicSchemaWire[]>), [schemas]);
  const navFolders = Object.keys(groupedNavSchemas).sort((a, b) => { if (a === 'Uncategorized') return -1; if (b === 'Uncategorized') return 1; return a.localeCompare(b); });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="layer-title text-2xl text-text dark:text-white">Schemas</h1>
        <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mt-1">Define custom content structures and manage their records</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link to="/admin/schemas" className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-tight transition-all ${!slug ? 'bg-layer-primary text-white' : 'bg-white dark:bg-dark-card text-text-secondary dark:text-dark-text-secondary border border-l5-border dark:border-dark-border hover:bg-l1-bg'}`}>Definitions</Link>
        {navFolders.map(folder => {
          const isSelected = selectedFolders.includes(folder);
          return (
            <button key={folder} onClick={() => setSelectedFolders(prev => prev.includes(folder) ? prev.filter(f => f !== folder) : [...prev, folder])}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-tight transition-all ${isSelected ? 'bg-layer-primary text-white' : 'bg-white dark:bg-dark-card text-text-secondary dark:text-dark-text-secondary border border-l5-border dark:border-dark-border hover:bg-l1-bg'}`}
            >{folder}</button>
          );
        })}
      </div>
      {loading ? (
        <div className="flex items-center gap-3 text-text-secondary font-bold text-sm"><div className="w-5 h-5 border-2 border-layer-primary border-t-transparent rounded-full animate-spin" />Loading schemas</div>
      ) : selectedSchema ? (
        <SchemaRecordsPanel schema={selectedSchema} records={records} loading={recordsLoading} onCreate={() => openRecordModal()} onEdit={openRecordModal} onDelete={deleteRecord} />
      ) : (
        <SchemaDefinitionsPanel schemas={selectedFolders.length === 0 ? schemas : schemas.filter(s => selectedFolders.includes(s.folder || 'Uncategorized'))} onCreate={() => openSchemaModal()} onEdit={openSchemaModal} onDelete={deleteSchema} />
      )}
      <Modal open={showSchemaModal} onClose={() => setShowSchemaModal(false)} title={editingSchema ? editingSchema.source === 'plugin' ? 'View Schema' : 'Edit Schema' : 'New Schema'} subtitle={editingSchema?.source === 'plugin' ? 'Read-only' : undefined} size="xl"
        footer={<><Button variant="secondary" onClick={() => setShowSchemaModal(false)}>{editingSchema?.source === 'plugin' ? 'Close' : 'Cancel'}</Button>{editingSchema?.source !== 'plugin' && <Button type="submit" form="schema-form">Save Schema</Button>}</>}
      >
        <form id="schema-form" onSubmit={saveSchema} className="space-y-5">
          {editingSchema?.source === 'plugin' && (
            <div className="bg-warning-light border border-warning/30 rounded-lg p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-warning rounded-lg flex items-center justify-center shrink-0"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <div><div className="layer-label text-warning">Read-only Schema</div><div className="text-xs font-medium text-warning/80">This schema is provided by the <strong>{editingSchema.pluginName}</strong> plugin.</div></div>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Name" value={schemaForm.name} required onChange={e => setSchemaForm(f => ({...f, name: e.target.value, slug: f.slug || sanitizeSlugInput(e.target.value)}))} readOnly={editingSchema?.source === 'plugin'} />
            <Input label="Slug" value={schemaForm.slug} required className="font-mono" onChange={e => setSchemaForm(f => ({...f, slug: sanitizeSlugInput(e.target.value)}))} readOnly={editingSchema?.source === 'plugin'} />
          </div>
          <Input label="Folder" value={schemaForm.folder || ''} placeholder="Optional category" onChange={e => setSchemaForm(f => ({...f, folder: e.target.value}))} readOnly={editingSchema?.source === 'plugin'} />
          <Textarea label="Description" value={schemaForm.description} className="min-h-24" onChange={e => setSchemaForm(f => ({...f, description: e.target.value}))} readOnly={editingSchema?.source === 'plugin'} />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="layer-label text-text dark:text-white">Fields</h3>
              {editingSchema?.source !== 'plugin' && <Button variant="ghost" size="sm" icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>} onClick={() => setSchemaForm(f => ({...f, fields: [...f.fields, emptyField()]}))}>Add Field</Button>}
            </div>
            {schemaForm.fields.map((field, index) => (
              <div key={index} className="grid lg:grid-cols-[1fr_1fr_140px_80px_36px] gap-3 bg-l1-bg dark:bg-dark-surface border border-l5-border dark:border-dark-border rounded-lg p-4">
                <Input placeholder="Label" value={field.label} required onChange={e => updateField(index, {label: e.target.value, name: field.name || sanitizeFieldInput(e.target.value)})} readOnly={editingSchema?.source === 'plugin'} />
                <Input placeholder="fieldName" value={field.name} required className="font-mono" onChange={e => updateField(index, {name: sanitizeFieldInput(e.target.value)})} readOnly={editingSchema?.source === 'plugin'} />
                <Select value={field.type} onChange={e => updateField(index, {type: e.target.value as DynamicSchemaFieldType})} disabled={editingSchema?.source === 'plugin'}>
                  {fieldTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
                <label className="flex items-center justify-center gap-1.5 text-[0.625rem] font-bold uppercase text-text-secondary dark:text-dark-text-secondary">
                  <input type="checkbox" checked={field.required || false} onChange={e => updateField(index, {required: e.target.checked})} disabled={editingSchema?.source === 'plugin'} className="w-3.5 h-3.5 rounded border-l5-border text-layer-primary" />
                  Req
                </label>
                <button type="button" onClick={() => setSchemaForm(f => ({...f, fields: f.fields.filter((_, i) => i !== index)}))} className="w-9 h-9 flex items-center justify-center text-danger hover:bg-danger-light rounded-lg transition-colors" disabled={schemaForm.fields.length === 1 || editingSchema?.source === 'plugin'}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                {field.type === 'select' && (
                  <Input placeholder="Options: Draft, Published, Archived" value={(field.options || []).map(o => o.label).join(', ')}
                    onChange={e => updateField(index, {options: e.target.value.split(',').map(v => v.trim()).filter(Boolean).map(v => ({label: v, value: v}))})}
                    readOnly={editingSchema?.source === 'plugin'} className="lg:col-span-5"
                  />
                )}
              </div>
            ))}
          </div>
        </form>
      </Modal>
      <Modal open={showRecordModal} onClose={() => setShowRecordModal(false)} title={editingRecord ? 'Edit Record' : `New ${selectedSchema?.name || 'Record'}`} size="lg"
        footer={<><Button variant="secondary" onClick={() => setShowRecordModal(false)}>Cancel</Button><Button type="submit" form="record-form">Save Record</Button></>}
      >
        <form id="record-form" onSubmit={saveRecord} className="space-y-4">
          {selectedSchema?.fields.map(field => (
            <RecordField key={field.name} field={field} value={recordForm[field.name]} onChange={v => setRecordForm(f => ({...f, [field.name]: v}))} />
          ))}
        </form>
      </Modal>
    </div>
  );
}

function SchemaFolder({folderName, schemas, onEdit, onDelete}: {folderName: string; schemas: DynamicSchemaWire[]; onEdit: (s: DynamicSchemaWire) => void; onDelete: (s: DynamicSchemaWire) => void}) {
  const [expanded, setExpanded] = useState(true);
  return (
    <Card className="mb-5">
      <button onClick={() => setExpanded(!expanded)} className={`w-full flex items-center justify-between p-5 bg-l1-bg/50 dark:bg-dark-surface hover:bg-l1-bg dark:hover:bg-dark-hover transition-colors ${expanded ? 'border-b border-l5-border dark:border-dark-border' : ''}`}>
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-lg text-text dark:text-white">{folderName}</h3>
          <span className="bg-layer-primary-light text-layer-primary text-[0.625rem] font-bold px-2.5 py-0.5 rounded">{schemas.length} {schemas.length === 1 ? 'schema' : 'schemas'}</span>
        </div>
        <svg className={`w-4 h-4 text-text-secondary transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {expanded && (
        <div className="p-5 space-y-3">
          {schemas.map(schema => (
            <div key={schema.slug} className="bg-white dark:bg-dark-card border border-l5-border dark:border-dark-border rounded-lg px-5 py-4 flex items-center justify-between hover:border-layer-primary/40 transition-colors">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Link to={`/admin/schemas/${schema.slug}`} className="font-bold text-text dark:text-white hover:text-layer-primary transition-colors truncate">{schema.name}</Link>
                <span className="text-xs font-mono font-medium text-text-secondary dark:text-dark-text-secondary shrink-0">{schema.slug}</span>
              </div>
              <div className="flex items-center gap-5 shrink-0 ml-4">
                <div className="flex items-center gap-3 text-[0.625rem] font-bold text-text-muted dark:text-dark-text-secondary uppercase">
                  <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>{schema.fields.length} fields</span>
                  <span className="flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>{schema.recordCount || 0} records</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => onEdit(schema)}>{schema.source === 'plugin' ? 'View' : 'Edit'}</Button>
                  {schema.source !== 'plugin' && (
                    <Button variant="danger" size="sm" icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>} onClick={() => onDelete(schema)}>Delete</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function SchemaDefinitionsPanel({schemas, onCreate, onEdit, onDelete}: {schemas: DynamicSchemaWire[]; onCreate: () => void; onEdit: (s: DynamicSchemaWire) => void; onDelete: (s: DynamicSchemaWire) => void}) {
  if (!schemas.length) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div><h2 className="layer-title text-xl text-text dark:text-white">Definitions</h2><p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Create a schema definition to start managing custom records.</p></div>
          <Button icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>} onClick={onCreate}>New Definition</Button>
        </div>
        <Card><CardBody>
          <div className="py-12 text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-l1-bg dark:bg-dark-surface border border-dashed border-l5-border dark:border-dark-border rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            </div>
            <h2 className="font-bold text-lg text-text-secondary dark:text-dark-text-secondary">No definitions yet</h2>
            <p className="text-xs font-medium text-text-muted dark:text-dark-text-secondary mt-1">Create your first schema definition to get started.</p>
          </div>
        </CardBody></Card>
      </div>
    );
  }
  const groupedSchemas = schemas.reduce((acc, s) => { const folder = s.folder || 'Uncategorized'; (acc[folder] ||= []).push(s); return acc; }, {} as Record<string, DynamicSchemaWire[]>);
  const folders = Object.keys(groupedSchemas).sort((a, b) => { if (a === 'Uncategorized') return -1; if (b === 'Uncategorized') return 1; return a.localeCompare(b); });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div><h2 className="layer-title text-xl text-text dark:text-white">Definitions</h2><p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">Manage custom content structures and their fields.</p></div>
        <Button icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>} onClick={onCreate}>New Definition</Button>
      </div>
      {folders.map(folder => <SchemaFolder key={folder} folderName={folder} schemas={groupedSchemas[folder]} onEdit={onEdit} onDelete={onDelete} />)}
    </div>
  );
}

function SchemaRecordsPanel({schema, records, loading, onCreate, onEdit, onDelete}: {schema: DynamicSchemaWire; records: DynamicRecordWire[]; loading: boolean; onCreate: () => void; onEdit: (r: DynamicRecordWire) => void; onDelete: (r: DynamicRecordWire) => void}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div><h2 className="layer-title text-xl text-text dark:text-white">{schema.name}</h2><p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">{schema.description || `${schema.fields.length} fields`}</p></div>
        <Button icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>} onClick={onCreate}>New Record</Button>
      </div>
      <div className="bg-white dark:bg-dark-card border border-l5-border dark:border-dark-border rounded-xl overflow-auto shadow-card">
        <table className="w-full text-left min-w-[760px]">
          <thead className="bg-l1-bg dark:bg-dark-surface text-[0.625rem] font-bold uppercase tracking-wide text-text-secondary dark:text-dark-text-secondary">
            <tr>{schema.fields.map(f => <th key={f.name} className="px-5 py-3.5">{f.label}</th>)}<th className="px-5 py-3.5">Updated</th><th className="px-5 py-3.5 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-l5-border dark:divide-dark-border">
            {loading ? (
              <tr><td colSpan={schema.fields.length + 2} className="px-5 py-16 text-center text-text-secondary font-bold text-xs">Loading records</td></tr>
            ) : records.length ? (
              records.map(record => (
                <tr key={record.id} className="hover:bg-l1-bg/50 dark:hover:bg-dark-hover/50 transition-colors">
                  {schema.fields.map(f => <td key={f.name} className="px-5 py-4 text-sm font-medium text-text dark:text-dark-text max-w-xs truncate">{formatRecordValue(record.data[f.name], f)}</td>)}
                  <td className="px-5 py-4 text-xs font-medium text-text-secondary dark:text-dark-text-secondary">{new Date(record.updatedAt).toLocaleString()}</td>
                  <td className="px-5 py-4"><div className="flex justify-end gap-2"><Button variant="secondary" size="sm" onClick={() => onEdit(record)}>Edit</Button><Button variant="danger" size="sm" onClick={() => onDelete(record)}>Delete</Button></div></td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={schema.fields.length + 2} className="px-5 py-16 text-center text-text-secondary dark:text-dark-text-secondary font-bold text-xs">No records</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecordField({field, value, onChange}: {field: DynamicSchemaField; value: unknown; onChange: (v: unknown) => void}) {
  const inputValue = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  if (field.type === 'textarea') return <Textarea label={`${field.label}${field.required ? ' *' : ''}`} value={inputValue} onChange={e => onChange(e.target.value)} required={field.required} className="min-h-32" />;
  if (field.type === 'checkbox') return (
    <label className="flex items-center gap-3 p-3 bg-l1-bg/50 dark:bg-dark-surface border border-l5-border dark:border-dark-border rounded-lg cursor-pointer">
      <input type="checkbox" checked={Boolean(value)} onChange={e => onChange(e.target.checked)} className="w-4 h-4 rounded border-l5-border text-layer-primary focus:ring-layer-primary/30" />
      <span className="layer-label text-text-secondary dark:text-dark-text-secondary">{field.label}{field.required ? ' *' : ''}</span>
    </label>
  );
  if (field.type === 'select') return (
    <Select label={`${field.label}${field.required ? ' *' : ''}`} value={inputValue} onChange={e => onChange(e.target.value)} required={field.required}>
      <option value="">Select...</option>
      {(field.options || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </Select>
  );
  return <Input label={`${field.label}${field.required ? ' *' : ''}`} type={field.type === 'date' ? 'date' : field.type} value={inputValue} onChange={e => onChange(e.target.value)} required={field.required} />;
}

function formatRecordValue(value: unknown, field: DynamicSchemaField): string { if (field.type === 'checkbox') return value ? 'Yes' : 'No'; if (value === undefined || value === null || value === '') return '-'; return String(value); }
function sanitizeSlugInput(v: string) { return v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]+/g, ''); }
function normalizeSlug(v: string) { return sanitizeSlugInput(v).trim().replace(/^-+|-+$/g, ''); }
function sanitizeFieldInput(v: string) { return v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]+/g, ''); }
function normalizeFieldName(v: string) { return sanitizeFieldInput(v).trim().replace(/^-+|-+$/g, ''); }
