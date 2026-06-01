import {
  Repository,
  EntityTarget,
  DataSource,
  ObjectLiteral,
  DeepPartial,
} from 'typeorm';

export abstract class BaseRepository<
  T extends ObjectLiteral,
> extends Repository<T> {
  constructor(entity: EntityTarget<T>, dataSource: DataSource) {
    super(entity, dataSource.createEntityManager());
  }

  async findById(id: string | number): Promise<T | null> {
    return this.findOne({where: {id} as unknown as any});
  }

  async findAll(): Promise<T[]> {
    return this.find();
  }

  async createOne(data: DeepPartial<T>): Promise<T> {
    const entity = this.create(data);
    return this.save(entity);
  }

  async updateOne(
    id: string | number,
    data: DeepPartial<T>
  ): Promise<T | null> {
    await this.update(id, data as unknown as any);
    return this.findById(id);
  }

  async deleteOne(id: string | number): Promise<void> {
    await this.delete(id);
  }
}
