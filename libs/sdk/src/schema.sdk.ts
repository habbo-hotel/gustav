import {
  DynamicRecordInput,
  DynamicRecordQueryInput,
  DynamicRecordQueryWire,
  DynamicRecordWire,
  DynamicSchemaDeleteCheckWire,
  DynamicSchemaInput,
  DynamicSchemaQueryWire,
  DynamicSchemaWire,
} from '@gustav/types';

import {BaseSDK} from './base.sdk';

export class SchemaSDK extends BaseSDK {
  async findAll(): Promise<DynamicSchemaWire[]> {
    return this.get<DynamicSchemaWire[]>('/schemas');
  }

  async findOne(slug: string): Promise<DynamicSchemaWire> {
    return this.get<DynamicSchemaWire>(`/schemas/${encodeURIComponent(slug)}`);
  }

  async findQueries(): Promise<DynamicSchemaQueryWire[]> {
    return this.get<DynamicSchemaQueryWire[]>('/schemas/queries');
  }

  async create(data: DynamicSchemaInput): Promise<DynamicSchemaWire> {
    return this.post<DynamicSchemaWire>('/schemas', data);
  }

  async update(
    slug: string,
    data: DynamicSchemaInput
  ): Promise<DynamicSchemaWire> {
    return this.put<DynamicSchemaWire>(
      `/schemas/${encodeURIComponent(slug)}`,
      data
    );
  }

  async checkDelete(slug: string): Promise<DynamicSchemaDeleteCheckWire> {
    return this.get<DynamicSchemaDeleteCheckWire>(
      `/schemas/${encodeURIComponent(slug)}/delete-check`
    );
  }

  async removeSchema(slug: string, deleteDependencies = false): Promise<void> {
    const query = deleteDependencies ? '?deleteDependencies=true' : '';
    return this.delete<void>(`/schemas/${encodeURIComponent(slug)}${query}`);
  }

  async findRecords(slug: string): Promise<DynamicRecordWire[]> {
    return this.get<DynamicRecordWire[]>(
      `/schemas/${encodeURIComponent(slug)}/records`
    );
  }

  async findRecord(slug: string, id: number): Promise<DynamicRecordWire> {
    return this.get<DynamicRecordWire>(
      `/schemas/${encodeURIComponent(slug)}/records/${id}`
    );
  }

  async findRecordByField(
    slug: string,
    fieldName: string,
    value: string
  ): Promise<DynamicRecordWire> {
    return this.get<DynamicRecordWire>(
      `/schemas/${encodeURIComponent(slug)}/by/${encodeURIComponent(
        fieldName
      )}/${encodeURIComponent(value)}`
    );
  }

  async queryRecords(
    slug: string,
    query: DynamicRecordQueryInput
  ): Promise<DynamicRecordQueryWire> {
    return this.post<DynamicRecordQueryWire>(
      `/schemas/${encodeURIComponent(slug)}/query`,
      query
    );
  }

  async findPublicQueries(): Promise<DynamicSchemaQueryWire[]> {
    return this.get<DynamicSchemaQueryWire[]>('/public/schemas/queries');
  }

  async findPublicRecords(slug: string): Promise<DynamicRecordWire[]> {
    return this.get<DynamicRecordWire[]>(
      `/public/schemas/${encodeURIComponent(slug)}/records`
    );
  }

  async findPublicRecord(slug: string, id: number): Promise<DynamicRecordWire> {
    return this.get<DynamicRecordWire>(
      `/public/schemas/${encodeURIComponent(slug)}/records/${id}`
    );
  }

  async findPublicRecordByField(
    slug: string,
    fieldName: string,
    value: string
  ): Promise<DynamicRecordWire> {
    return this.get<DynamicRecordWire>(
      `/public/schemas/${encodeURIComponent(slug)}/by/${encodeURIComponent(
        fieldName
      )}/${encodeURIComponent(value)}`
    );
  }

  async queryPublicRecords(
    slug: string,
    query: DynamicRecordQueryInput
  ): Promise<DynamicRecordQueryWire> {
    return this.post<DynamicRecordQueryWire>(
      `/public/schemas/${encodeURIComponent(slug)}/query`,
      query
    );
  }

  async createRecord(
    slug: string,
    data: DynamicRecordInput
  ): Promise<DynamicRecordWire> {
    return this.post<DynamicRecordWire>(
      `/schemas/${encodeURIComponent(slug)}/records`,
      data
    );
  }

  async updateRecord(
    slug: string,
    id: number,
    data: DynamicRecordInput
  ): Promise<DynamicRecordWire> {
    return this.put<DynamicRecordWire>(
      `/schemas/${encodeURIComponent(slug)}/records/${id}`,
      data
    );
  }

  async removeRecord(slug: string, id: number): Promise<void> {
    return this.delete<void>(
      `/schemas/${encodeURIComponent(slug)}/records/${id}`
    );
  }
}
