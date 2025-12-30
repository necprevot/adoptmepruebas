import { usersService } from "../services/index.js"
import __dirname from "../utils/index.js";

const getAllUsers = async(req,res)=>{
    const users = await usersService.getAll();
    res.send({status:"success",payload:users})
}

const getUser = async(req,res)=> {
    const userId = req.params.uid;
    const user = await usersService.getUserById(userId);
    if(!user) return res.status(404).send({status:"error",error:"User not found"})
    res.send({status:"success",payload:user})
}

const updateUser =async(req,res)=>{
    const updateBody = req.body;
    const userId = req.params.uid;
    const user = await usersService.getUserById(userId);
    if(!user) return res.status(404).send({status:"error", error:"User not found"})
    const result = await usersService.update(userId,updateBody);
    res.send({status:"success",message:"User updated"})
}

const deleteUser = async(req,res) =>{
    const userId = req.params.uid;
    const user = await usersService.getUserById(userId);
    if(!user) return res.status(404).send({status:"error", error:"User not found"})
    await usersService.delete(userId);
    res.send({status:"success",message:"User deleted"})
}

const uploadDocuments = async(req, res) => {
    try {
        const userId = req.params.uid;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).send({ 
                status: "error", 
                error: "No files uploaded" 
            });
        }

        const user = await usersService.getUserById(userId);
        if (!user) {
            return res.status(404).send({ 
                status: "error", 
                error: "User not found" 
            });
        }

        // Crear array de documentos con la estructura requerida
        const documents = files.map(file => ({
            name: file.originalname,
            reference: `/documents/${file.filename}`
        }));

        // Agregar los nuevos documentos al array existente
        const updatedDocuments = [...(user.documents || []), ...documents];

        // Actualizar el usuario con los nuevos documentos
        await usersService.update(userId, { documents: updatedDocuments });

        res.send({ 
            status: "success", 
            message: "Documents uploaded successfully",
            payload: {
                uploadedFiles: documents.length,
                documents: documents
            }
        });
    } catch (error) {
        console.error('Error uploading documents:', error);
        res.status(500).send({ 
            status: "error", 
            error: error.message 
        });
    }
}

export default {
    deleteUser,
    getAllUsers,
    getUser,
    updateUser,
    uploadDocuments
}