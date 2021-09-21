import {ContactController} from '../controllers/contactController';
import {AuthController} from "../controllers/authController";
import Auth from "../middleware/authMiddleware";
import {Router} from 'express';
import { body, CustomValidator } from "express-validator";
const router: Router = Router();
//Route Login
router.post("/login", 
body("username").isLength({min:5}).withMessage("Username minimal 5 karakter"), 
body("password").isLength({min:4}).withMessage("Password minimal 4 karakter"), 
AuthController.login);

//Route Register
router.post("/register", 
body("username").isLength({min:5}).withMessage("Username minimal 5 karakter"), 
body("password").isLength({min:4}).withMessage("Password minimal 4 karakter"), 
AuthController.register);


// membuat kontak baru
router.post("/buat", Auth.checkToken, ContactController.create);

// melihat daftar seluruh kontak
router.get("/daftar", Auth.checkToken, ContactController.findAll);

// ubah kontak
router.put("/ubah/:id", Auth.checkToken, ContactController.update);

// menghapus kontak
router.delete("/hapus/:id", Auth.checkToken, ContactController.delete);

router.get("/daftarlog", Auth.checkToken, ContactController.join);

export {router};