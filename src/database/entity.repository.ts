import { Document, FilterQuery, Model, PopulateOptions, UpdateQuery } from 'mongoose';
import * as mongoose from 'mongoose';

export abstract class EntityRepository<T extends Document> {
  protected constructor(protected readonly entityModel: Model<T>) {}

  async findOne(entityFilterQuery: FilterQuery<T>, projection?: Record<string, unknown>): Promise<T | null> {
    return this.entityModel
      .findOne(entityFilterQuery, {
        // _id: 0,
        __v: 0,
        ...projection
      })
      .exec();
  }

  async find(entityFilterQuery: FilterQuery<T>): Promise<T[] | null> {
    return this.entityModel.find(entityFilterQuery).limit(10).exec();
  }

  async findAllWithQuery(
    entityFilterQuery: FilterQuery<T>,
    filterSort: FilterQuery<T>,
    page = 0,
    populate: PopulateOptions | PopulateOptions[]
  ): Promise<T[] | null> {
    if (page > 10) page = 10;

    return this.entityModel
      .find(entityFilterQuery)
      .sort(filterSort)
      .limit(10)
      .skip(10 * page)
      .populate(populate)
      .exec();
  }

  async create(createEntityData: unknown, session: mongoose.ClientSession | null = null): Promise<T> {
    const entity = new this.entityModel(createEntityData);
    return entity.save({ session });
  }

  async findOneAndUpdate(
    entityFilterQuery: FilterQuery<T>,
    updateEntityData: UpdateQuery<unknown>,
    session: mongoose.ClientSession | null = null
  ): Promise<T | null> {
    return this.entityModel
      .findOneAndUpdate(entityFilterQuery, updateEntityData, {
        new: true
      })
      .session(session);
  }

  async findOneAndDelete(entityFilterQuery: FilterQuery<T>): Promise<T | null> {
    return this.entityModel.findOneAndDelete(entityFilterQuery);
  }

  async deleteMany(entityFilterQuery: FilterQuery<T>): Promise<boolean> {
    const deleteResult = await this.entityModel.deleteMany(entityFilterQuery);
    return deleteResult.deletedCount >= 1;
  }
}
