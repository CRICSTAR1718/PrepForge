import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },

        passwordHash: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
        },

        domain: {
            type: String,
            enum: ["DSA", "Full Stack", "Aptitude"],
            default: null,
        },

        planDuration: {
            type: Number,
            min: 15,
            max: 90,
            default: null,
        },

        currentPlanId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Plan",
            default: null,
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt automatically
    }
);

// Hash password before saving to DB
userSchema.pre("save", async function () {
    if (!this.isModified("passwordHash")) return;
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Method to compare entered password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.passwordHash);
};

const User = mongoose.model("User", userSchema);

export default User;