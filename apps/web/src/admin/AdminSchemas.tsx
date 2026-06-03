import toast from 'react-hot-toast';
import React, {useEffect, useMemo, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {
  DynamicRecordWire,
  DynamicSchemaField,
  DynamicSchemaFieldType,
  DynamicSchemaInput,
  DynamicSchemaWire,
} from '@gustav/types';

import {schemaSdk} from '../sdk';

const fieldTypes: DynamicSchemaFieldType[] = [
  'text',
  'textarea',
  'number',
  'checkbox',
  'date',
  'select',
];

const emptyField = (): DynamicSchemaField => ({
  name: '',
  label: '',
  type: 'text',
  required: false,
});

const emptySchemaForm = (): DynamicSchemaInput => ({
  name: '',
  slug: '',
  description: '',
  fields: [emptyField()],
});

export function AdminSchemas() {
  const {slug} = useParams();
  const navigate = useNavigate();
  const [schemas, setSchemas] = useState<DynamicSchemaWire[]>([]);
  const [records, setRecords] = useState<DynamicRecordWire[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editingSchema, setEditingSchema] = useState<DynamicSchemaWire | null>(
    null
  );
  const [editingRecord, setEditingRecord] = useState<DynamicRecordWire | null>(
    null
  );
  const [schemaForm, setSchemaForm] =
    useState<DynamicSchemaInput>(emptySchemaForm());
  const [recordForm, setRecordForm] = useState<Record<string, unknown>>({});

  const selectedSchema = useMemo(
    () => schemas.find(schema => schema.slug === slug) || null,
    [schemas, slug]
  );

  useEffect(() => {
    document.title = 'Gustav - Schemas';
    fetchSchemas();
  }, []);

  useEffect(() => {
    if (selectedSchema) {
      fetchRecords(selectedSchema.slug);
    } else {
      setRecords([]);
    }
  }, [selectedSchema?.slug]);

  const fetchSchemas = async () => {
    try {
      setLoading(true);
      const data = await schemaSdk.findAll();
      setSchemas(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to load schemas'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async (schemaSlug: string) => {
    try {
      setRecordsLoading(true);
      const data = await schemaSdk.findRecords(schemaSlug);
      setRecords(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to load records'
      );
    } finally {
      setRecordsLoading(false);
    }
  };

  const openSchemaModal = (schema?: DynamicSchemaWire) => {
    setEditingSchema(schema || null);
    setSchemaForm(
      schema
        ? {
            name: schema.name,
            slug: schema.slug,
            description: schema.description || '',
            fields: schema.fields.length ? schema.fields : [emptyField()],
          }
        : emptySchemaForm()
    );
    setShowSchemaModal(true);
  };

  const openRecordModal = (record?: DynamicRecordWire) => {
    if (!selectedSchema) return;

    setEditingRecord(record || null);
    const nextData: Record<string, unknown> = {};
    selectedSchema.fields.forEach(field => {
      nextData[field.name] =
        record?.data?.[field.name] ?? (field.type === 'checkbox' ? false : '');
    });
    setRecordForm(nextData);
    setShowRecordModal(true);
  };

  const saveSchema = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...schemaForm,
        slug: normalizeSlug(schemaForm.slug || schemaForm.name),
        fields: schemaForm.fields.map(field => ({
          ...field,
          name: normalizeFieldName(field.name || field.label),
        })),
      };

      const saved = editingSchema
        ? await schemaSdk.update(editingSchema.slug, payload)
        : await schemaSdk.create(payload);

      setShowSchemaModal(false);
      await fetchSchemas();
      navigate(`/admin/schemas/${saved.slug}`);
      toast.success(editingSchema ? 'Schema updated' : 'Schema created');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save schema');
    }
  };

  const deleteSchema = async (schema: DynamicSchemaWire) => {
    try {
      const check = await schemaSdk.checkDelete(schema.slug);
      if (!check.canDelete) {
        const summary = check.dependencies
          .map(dep => `${dep.count} ${dep.label}`)
          .join(', ');
        const confirmed = window.confirm(
          `Schema "${schema.name}" has dependencies: ${summary}. Delete ${check.dependencyCount} dependencies too?`
        );

        if (!confirmed) return;
        await schemaSdk.removeSchema(schema.slug, true);
      } else {
        const confirmed = window.confirm(`Delete schema "${schema.name}"?`);
        if (!confirmed) return;
        await schemaSdk.removeSchema(schema.slug);
      }

      toast.success('Schema deleted');
      await fetchSchemas();
      navigate('/admin/schemas');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete schema'
      );
    }
  };

  const saveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchema) return;

    try {
      if (editingRecord) {
        await schemaSdk.updateRecord(selectedSchema.slug, editingRecord.id, {
          data: recordForm,
        });
        toast.success('Record updated');
      } else {
        await schemaSdk.createRecord(selectedSchema.slug, {data: recordForm});
        toast.success('Record created');
      }
      setShowRecordModal(false);
      fetchRecords(selectedSchema.slug);
      fetchSchemas();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save record');
    }
  };

  const deleteRecord = async (record: DynamicRecordWire) => {
    if (!selectedSchema) return;
    if (!window.confirm('Delete this record?')) return;

    try {
      await schemaSdk.removeRecord(selectedSchema.slug, record.id);
      toast.success('Record deleted');
      fetchRecords(selectedSchema.slug);
      fetchSchemas();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete record'
      );
    }
  };

  const updateField = (index: number, updates: Partial<DynamicSchemaField>) => {
    setSchemaForm(form => ({
      ...form,
      fields: form.fields.map((field, fieldIndex) =>
        fieldIndex === index ? {...field, ...updates} : field
      ),
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
            Schemas
          </h1>
          <p className="text-gray-500 dark:text-zinc-400 font-medium mt-2 max-w-3xl">
            Define custom content structures and manage their records without
            writing migrations or code.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-zinc-800 pb-3">
        <Link
          to="/admin/schemas"
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            !slug
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          Definitions
        </Link>
        {schemas.map(schema => (
          <Link
            key={schema.slug}
            to={`/admin/schemas/${schema.slug}`}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              slug === schema.slug
                ? 'bg-indigo-600 text-white'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            {schema.name}
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 font-black uppercase tracking-widest text-xs">
          Loading schemas
        </div>
      ) : selectedSchema ? (
        <SchemaRecordsPanel
          schema={selectedSchema}
          records={records}
          loading={recordsLoading}
          onCreate={() => openRecordModal()}
          onEdit={openRecordModal}
          onDelete={deleteRecord}
        />
      ) : (
        <SchemaDefinitionsPanel
          schemas={schemas}
          onCreate={() => openSchemaModal()}
          onEdit={openSchemaModal}
          onDelete={deleteSchema}
        />
      )}

      {showSchemaModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={saveSchema}
            className="bg-white dark:bg-zinc-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800"
          >
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                {editingSchema ? 'Edit Schema' : 'New Schema'}
              </h2>
              <button
                type="button"
                onClick={() => setShowSchemaModal(false)}
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <label className="space-y-2">
                  <span className="text-xs font-black uppercase text-gray-500">
                    Name
                  </span>
                  <input
                    value={schemaForm.name}
                    onChange={e =>
                      setSchemaForm(form => ({
                        ...form,
                        name: e.target.value,
                        slug: form.slug || sanitizeSlugInput(e.target.value),
                      }))
                    }
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 dark:text-white"
                    required
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-black uppercase text-gray-500">
                    Slug
                  </span>
                  <input
                    value={schemaForm.slug}
                    onChange={e =>
                      setSchemaForm(form => ({
                        ...form,
                        slug: sanitizeSlugInput(e.target.value),
                      }))
                    }
                    className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-mono dark:text-white"
                    required
                  />
                </label>
              </div>

              <label className="space-y-2 block">
                <span className="text-xs font-black uppercase text-gray-500">
                  Description
                </span>
                <textarea
                  value={schemaForm.description}
                  onChange={e =>
                    setSchemaForm(form => ({
                      ...form,
                      description: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 min-h-24 dark:text-white"
                />
              </label>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">
                    Fields
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setSchemaForm(form => ({
                        ...form,
                        fields: [...form.fields, emptyField()],
                      }))
                    }
                    className="text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase"
                  >
                    Add Field
                  </button>
                </div>

                {schemaForm.fields.map((field, index) => (
                  <div
                    key={index}
                    className="grid lg:grid-cols-[1fr_1fr_150px_90px_40px] gap-3 bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 rounded-xl p-3"
                  >
                    <input
                      placeholder="Label"
                      value={field.label}
                      onChange={e =>
                        updateField(index, {
                          label: e.target.value,
                          name:
                            field.name || sanitizeFieldInput(e.target.value),
                        })
                      }
                      className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 dark:text-white"
                      required
                    />
                    <input
                      placeholder="fieldName"
                      value={field.name}
                      onChange={e =>
                        updateField(index, {
                          name: sanitizeFieldInput(e.target.value),
                        })
                      }
                      className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 font-mono dark:text-white"
                      required
                    />
                    <select
                      value={field.type}
                      onChange={e =>
                        updateField(index, {
                          type: e.target.value as DynamicSchemaFieldType,
                        })
                      }
                      className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 dark:text-white"
                    >
                      {fieldTypes.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center justify-center gap-2 text-xs font-bold uppercase text-gray-500">
                      <input
                        type="checkbox"
                        checked={field.required || false}
                        onChange={e =>
                          updateField(index, {required: e.target.checked})
                        }
                      />
                      Required
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setSchemaForm(form => ({
                          ...form,
                          fields: form.fields.filter(
                            (_, fieldIndex) => fieldIndex !== index
                          ),
                        }))
                      }
                      className="text-red-500 hover:bg-red-500/10 rounded-lg"
                      disabled={schemaForm.fields.length === 1}
                    >
                      X
                    </button>
                    {field.type === 'select' && (
                      <input
                        placeholder="Options: Draft, Published, Archived"
                        value={(field.options || [])
                          .map(option => option.label)
                          .join(', ')}
                        onChange={e =>
                          updateField(index, {
                            options: e.target.value
                              .split(',')
                              .map(value => value.trim())
                              .filter(Boolean)
                              .map(value => ({
                                label: value,
                                value,
                              })),
                          })
                        }
                        className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 dark:text-white"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSchemaModal(false)}
                className="px-5 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-3 rounded-xl font-black uppercase text-xs bg-indigo-600 text-white"
              >
                Save Schema
              </button>
            </div>
          </form>
        </div>
      )}

      {showRecordModal && selectedSchema && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={saveRecord}
            className="bg-white dark:bg-zinc-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800"
          >
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                {editingRecord ? 'Edit Record' : `New ${selectedSchema.name}`}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {selectedSchema.fields.map(field => (
                <RecordField
                  key={field.name}
                  field={field}
                  value={recordForm[field.name]}
                  onChange={value =>
                    setRecordForm(form => ({...form, [field.name]: value}))
                  }
                />
              ))}
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRecordModal(false)}
                className="px-5 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-3 rounded-xl font-black uppercase text-xs bg-indigo-600 text-white"
              >
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function SchemaDefinitionsPanel({
  schemas,
  onCreate,
  onEdit,
  onDelete,
}: {
  schemas: DynamicSchemaWire[];
  onCreate: () => void;
  onEdit: (schema: DynamicSchemaWire) => void;
  onDelete: (schema: DynamicSchemaWire) => void;
}) {
  if (!schemas.length) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              Definitions
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Create a schema definition to start managing custom records.
            </p>
          </div>
          <button
            onClick={onCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest"
          >
            New Definition
          </button>
        </div>
        <div className="py-24 text-center border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl">
          <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">
            No definitions yet
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            Definitions
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Manage custom content structures and their fields.
          </p>
        </div>
        <button
          onClick={onCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest"
        >
          New Definition
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-zinc-950 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <tr>
              <th className="px-6 py-4">Schema</th>
              <th className="px-6 py-4">Fields</th>
              <th className="px-6 py-4">Records</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {schemas.map(schema => (
              <tr key={schema.slug}>
                <td className="px-6 py-5">
                  <Link
                    to={`/admin/schemas/${schema.slug}`}
                    className="font-black text-gray-900 dark:text-white hover:text-indigo-600"
                  >
                    {schema.name}
                  </Link>
                  <div className="text-xs text-gray-400 font-mono">
                    {schema.slug}
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-gray-500">
                  {schema.fields.map(field => field.label).join(', ')}
                </td>
                <td className="px-6 py-5 text-sm font-bold text-gray-700 dark:text-zinc-300">
                  {schema.recordCount || 0}
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(schema)}
                      className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-xs font-bold"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(schema)}
                      className="px-3 py-2 rounded-lg bg-red-500/10 text-red-600 text-xs font-bold"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SchemaRecordsPanel({
  schema,
  records,
  loading,
  onCreate,
  onEdit,
  onDelete,
}: {
  schema: DynamicSchemaWire;
  records: DynamicRecordWire[];
  loading: boolean;
  onCreate: () => void;
  onEdit: (record: DynamicRecordWire) => void;
  onDelete: (record: DynamicRecordWire) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            {schema.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {schema.description || `${schema.fields.length} fields`}
          </p>
        </div>
        <button
          onClick={onCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest"
        >
          New Record
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-auto">
        <table className="w-full text-left min-w-[760px]">
          <thead className="bg-gray-50 dark:bg-zinc-950 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <tr>
              {schema.fields.map(field => (
                <th key={field.name} className="px-6 py-4">
                  {field.label}
                </th>
              ))}
              <th className="px-6 py-4">Updated</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td
                  colSpan={schema.fields.length + 2}
                  className="px-6 py-16 text-center text-gray-400 font-black uppercase tracking-widest text-xs"
                >
                  Loading records
                </td>
              </tr>
            ) : records.length ? (
              records.map(record => (
                <tr key={record.id}>
                  {schema.fields.map(field => (
                    <td
                      key={field.name}
                      className="px-6 py-5 text-sm text-gray-700 dark:text-zinc-300 max-w-xs truncate"
                    >
                      {formatRecordValue(record.data[field.name], field)}
                    </td>
                  ))}
                  <td className="px-6 py-5 text-xs text-gray-400">
                    {new Date(record.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(record)}
                        className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-zinc-800 text-xs font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(record)}
                        className="px-3 py-2 rounded-lg bg-red-500/10 text-red-600 text-xs font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={schema.fields.length + 2}
                  className="px-6 py-16 text-center text-gray-400 font-black uppercase tracking-widest text-xs"
                >
                  No records
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecordField({
  field,
  value,
  onChange,
}: {
  field: DynamicSchemaField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const inputValue =
    typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  const label = (
    <span className="text-xs font-black uppercase text-gray-500">
      {field.label}
      {field.required ? ' *' : ''}
    </span>
  );

  if (field.type === 'textarea') {
    return (
      <label className="space-y-2 block">
        {label}
        <textarea
          value={inputValue}
          onChange={e => onChange(e.target.value)}
          required={field.required}
          className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 min-h-32 dark:text-white"
        />
      </label>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={e => onChange(e.target.checked)}
        />
        {label}
      </label>
    );
  }

  if (field.type === 'select') {
    return (
      <label className="space-y-2 block">
        {label}
        <select
          value={inputValue}
          onChange={e => onChange(e.target.value)}
          required={field.required}
          className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 dark:text-white"
        >
          <option value="">Select...</option>
          {(field.options || []).map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="space-y-2 block">
      {label}
      <input
        type={field.type === 'date' ? 'date' : field.type}
        value={inputValue}
        onChange={e => onChange(e.target.value)}
        required={field.required}
        className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 dark:text-white"
      />
    </label>
  );
}

function formatRecordValue(value: unknown, field: DynamicSchemaField): string {
  if (field.type === 'checkbox') {
    return value ? 'Yes' : 'No';
  }

  if (value === undefined || value === null || value === '') {
    return '-';
  }

  return String(value);
}

function sanitizeSlugInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]+/g, '');
}

function normalizeSlug(value: string): string {
  return sanitizeSlugInput(value)
    .trim()
    .replace(/^-+|-+$/g, '');
}

function sanitizeFieldInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]+/g, '');
}

function normalizeFieldName(value: string): string {
  return sanitizeFieldInput(value)
    .trim()
    .replace(/^-+|-+$/g, '');
}
