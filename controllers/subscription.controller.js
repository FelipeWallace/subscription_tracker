// import { workflowClient } from "../config/upstash.js";
import Subscription from "../models/subscription.model.js";
// import { SERVER_URL } from "../config/env.js";

export const createSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.create({
            ...req.body,
            user: req.user._id,
        });

        // const { workflowRunId } = await workflowClient.trigger({
        //     url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
        //     body: {
        //         subscriptionId: subscription.id,
        //     },
        //     headers: {
        //         'content-type': 'application/json',
        //     },
        //     retries: 0,
        // })

        // res.status(201).json({ success: true, data: subscription, workflowRunId });

        res.status(201).json({ success: true, data: subscription });
    } catch (error) {
        next(error);
    }

}

export const getUserSubscriptions = async (req, res, next) => {
    try {
        if (req.user.id !== req.params.id) {
            const error = new Error('You can only get your subscriptions');
            error.status = 401;
            throw error;
        }

        const { search, page = 1, limit = 10 } = req.query; // Obtém os parâmetros de busca e paginação
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber; // Define quantos documentos pular

        let query = { user: req.params.id }; // Filtra assinaturas do usuário

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { type: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } }
            ];
        }

        const subscriptions = await Subscription.find(query)
            .skip(skip)
            .limit(limitNumber);

        const total = await Subscription.countDocuments(query); // Conta o total de resultados

        res.status(200).json({
            success: true,
            data: subscriptions,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(total / limitNumber),
                totalResults: total,
                pageSize: limitNumber
            }
        });
    } catch (error) {
        next(error);
    }
};
