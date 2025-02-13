import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Subscription name is required"],
        trim: true,
        minLength: [3, "Subscription name must be at least 3 characters"],
        maxLength: [1000, "Subscription name must be at most 1000 characters"],
    },
    price: {
        type: Number,
        required: [true, "Subscription price is required"],
        min: [0, "Subscription price must be greater than 0"],
    },
    currency: {
        type: String,
        enum: ["USD", "EUR", "GBP", "BRL"],
        default: "BRL",
    },
    frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly", "yearly"],
    },
    categoty: {
        type: String,
        enum: ["sports", "entertainment", "health", "technology", "news", "lifestyle", "other"],
        required: [true, "Subscription category is required"],
    },
    paymentMethod: {
        type: String,
        required: [true, "Subscription payment method is required"],
        trim: true,
    },
    type: {
        type: String,
        enum: ["active", "cancelled", "expired"],
        default: "active",   
    },
    startDate: {
        type: Date,
        required: true,
        validate: {
            validator: (value) => value <= Date.now(),
            message: "Start date must be in the past"
        }
    },
    renewalDate: {
        type: Date,
        validate: {
            validator: function(value) {
                return value > this.startDate
            },
            message: "renewal date must be greater than start date"
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    }
}, { timestamps: true });

// auto calculate renewal date if missing
subscriptionSchema.pre("save", function(next) {
    if (!this.renewalDate) {
        const renewalPeriods = {
            daily: 1,
            weekly: 7,
            monthly: 30,
            yearly: 365,   
        };

        this.renewalDate = new Date(this.startDate);
        this.renewalDate.setDate(this.renewalDate.getDate() + renewalPeriods[this.frequency]);
    }

    // auto update the status if renewal date has passed
    if (this.renewalDate < Date.now()) {
        this.type = "expired";
    }

    next();
})

const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;