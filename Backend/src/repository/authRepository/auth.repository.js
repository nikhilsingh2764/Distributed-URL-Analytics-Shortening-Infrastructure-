import User from "../../model/authModel/auth.model.js";


class UserRepository {


    async Create(data) {
        return await User.create(data)
    }

    async findById(id) {
        return await User.findOne({ id });
    }

    async findAll() {
        return await User.find();
    }

    async findByEmail(email) {
        return await User.findOne({ email }).select("+password");
    }

    async findByIdWithPassword(id) {
        return await User.findById(id).select("+password");
    }

    async findByUsername(username) {
        return await User.findOne({ username })
    }

    async findByUsernameOrEmail(username, email) {
        return await User.findOne({
            $or: [
                { username },
                { email }
            ]
        });
    }

    async verifyEmail(id) {
        return await User.findByIdAndUpdate(
            id,
            {
                isVerified: true
            },
            {
                new: true
            }
        )
    };


    async emailExist(email) {
        return await User.exists({ email });
    }

    async usernameExist(username) {
        return await User.exists({ username });
    }



    async findByIdAndDelete(id) {
        return await User.findByIdAndDelete(id);
    }

    async deactivateAccount(id) {
        return await User.findByIdAndUpdate(
            id,
            {
                isActive: false //User account is deactivated. ❌
            },                  //if true account is activate.  ✅
            {
                //return updated document where isActive is false if return updated doc in normal isActive is true  
                returnDocument: "after",
                runValidators: true

            }
        );
    }

    async updateProfile(id, data) {
        return await User.findByIdAndUpdate(
            id,
            data,
            {
                new: true,
                runValidators: true  //first run schema validation like min:18, include:@ then update
            }

        )
    }

    async changePassword(id, password) {
        return await User.findByIdAndUpdate(
            id,
            {
                password
            },
            {
                new: true,
                runValidators: true
            }
        );
    }


    async updatePasswordByEmail(email, password) {
        return await User.findOneAndUpdate(
            { email },
            {
                password
            },
            {
                new: true,
                runValidators: true
            }
        );
    }



};

export default new UserRepository();