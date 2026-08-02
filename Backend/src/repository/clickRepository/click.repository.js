import Click from "../../model/analyticsModel/click.model.js";

class clickRepository {

    async create(data) {
        return await Click.click(data);
    }

    async findByUrlId(urlId) {
        return await Click.find({ urlId })
            .sort({ createdAt: -1 });
    }

    async countByUrlId(urlId) {
        return await Click.countDocuments({ urlId });
    }


    async findByUrlIdAndDateRange(urlId, startDate, EndDate) {
        return await Click.find({
            urlId,
            createdAt: {
                $gte: startDate,
                $lte: EndDate
            }
        })
    }

    async countByUrlIdAndDateRange(urlId, startDate, endDate) {
        return await Click.countDocuments({
            urlId,
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        })
    }


}

export default new clickRepository();