import { Logger, NotFoundException } from '@nestjs/common';
import { FilterQuery, Model, Types } from 'mongoose';
import { AbstractDocument } from './abstract.schema';
export abstract class AbstractRepository<TDocument extends AbstractDocument> {
    protected abstract readonly logger: Logger

    constructor(protected readonly model: Model<TDocument>) { }

    async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
        this.logger.debug(`Creating document ${JSON.stringify(document)}`)
        const createdDocument = new this.model({
            ...document,
            _id: new Types.ObjectId()
        })
        return (await createdDocument.save()).toJSON() as unknown as TDocument
    }

    async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
        const document = await this.model.findOne(filterQuery, {}, { lean: true })
        if (!document) {
            this.logger.debug(`No document found with filter ${JSON.stringify(filterQuery)}`)
            throw new NotFoundException('document not found')
        }

        return document as unknown as TDocument
    }

    async findOneAndUpdate(filterQuery: FilterQuery<TDocument>, update: Partial<TDocument>): Promise<TDocument> {
        const document = await this.model.findOneAndUpdate(filterQuery, update, { new: true, lean: true })

        if (!document) {
            this.logger.debug(`No document found with filter ${JSON.stringify(filterQuery)}`)
            throw new NotFoundException('document not found')
        }
        return document as unknown as TDocument
    }

    async findMany(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
        return this.model.find(filterQuery, {}, { lean: true }) as unknown as TDocument[]
    }

    async findOneAndDelete(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
        return this.model.findOneAndDelete(filterQuery, { lean: true }) as unknown as TDocument
    }
}