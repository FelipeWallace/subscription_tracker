import User from "../models/user.model.js";

// export const getAllUsers = async (req, res, next) => {
//     try {
//         const users = await User.find();

//         res.status(200).json({ success: true, data: users });
//     } catch (error) {
//         next(error);
//     }
// }

export const getAllUsers = async (req, res, next) => {
    try {
        const { search } = req.query; // Obtém o parâmetro de busca da URL
        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },  // Busca pelo nome (insensível a maiúsculas)
                { email: { $regex: search, $options: "i" } } // Busca pelo e-mail
            ];
        }

        const users = await User.find(query).select("-password"); // Exclui o campo 'password' da resposta
        
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};


export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password'); // exclude password

        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
}