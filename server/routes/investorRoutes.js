import express from "express";

import { getAllInvestors } from "../controllers/investorController.js";

const router = express.Router();

router.get("/", getAllInvestors);

export default router;
