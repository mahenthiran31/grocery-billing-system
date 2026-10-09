import {Router} from "express";import * as c from "../controllers/tableController.js";import {auth} from "../middleware/auth.js";
const r=Router();r.use(auth);r.get("/",c.list);r.post("/",c.create);r.patch("/:id/status",c.setStatus);export default r;
