import { connect } from "mongoose";
require("dotenv").config();

export function connect() {
	connect(process.env.MONGODB_URL, {
		useNewUrlparser: true,
		useUnifiedTopology: true,
    })
    .then(console.log(`DB Connection Success`))
    .catch((err) => {
        console.log(`DB Connection Failed`);
        console.log(err);
        process.exit(1);
    });
}