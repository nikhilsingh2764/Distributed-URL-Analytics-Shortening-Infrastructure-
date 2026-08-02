import URL from "../../model/urlModel/url.model.js";

class UrlRepository {

    async create(data) {
        return await URL.create(data);
    }

    async findById(id) {
        return await URL.findById(id);
    }

    async findByIdAndUserId(id, userId) {
        return await Url.findOne({
            _id: id,
            userId
        });
    }

    async findByShortCode(shortCode) {
        return await Url.findOne({ shortCode });
    }

    async findByShortCodeAndUserId(shortCode, userId) {
        return await Url.findOne({
            shortCode,
            userId
        })
    }

    async findAllByUserId(userId, filter = {}, options = {}) {

        const {
            skip = 0,
            limit = 10,
            sort = { createdAt: -1 }
        } = options;

        return await Url.find({
            userId,
            ...filter
        })
            .sort(sort)
            .skip(skip)
            .limit(limit)

    }

    async countByUserId(userId, filter = {}) {
        return await Url.countDocuments({
            userId,
            ...filter
        })
    }


    async updateByIdAndUserId(id, userId, data) {
        return await Url.findOneAndUpdate(
            {
                _id: id,
                userId
            },
            data,
            {
                new: true,
                runValidators: true
            }
        );
    }


    async deleteByIdAndUserId(id, userId) {
        return await Url.findOneAndDelete({
            _id: id,
            userId
        });
    }


    async incrementClicks(id) {
        return await Url.findByIdAndUpdate(
            id,
            {
                $inc: {
                    clicks: 1
                }
            },
            {
                new: true
            }
        );
    }


    async findExpiredUrls() {
        return await Url.find({
            expiresAt: {
                $lte: new Date()
            }
        });
    }


    async deleteExpiredUrls() {
        return await Url.deleteMany({
            expiresAt: {
                $lte: new Date()
            }
        });
    }

}

export default new UrlRepository();