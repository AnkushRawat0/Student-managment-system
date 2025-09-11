import Batch from "../models/Batch.js";

export const createBatch = async(req,res)=>{
    try{
        const {name,course,coach,startDate,endDate,students}= req.body;

        const batch = await Batch.create({name,course,coach,startDate,endDate,students})
        res.status(201).json(batch);
    }catch(err){
        res.status(500).json({message:err.message})
  }
}

//get all batches
export const getAllBatches = async(req,res)=>{
    try{
        const batches = await Batch.find().populate("course").populate("coach","-password");
        res.status(200).json(batches);
    }catch(err){
        res.status(500).json({message:err.message})
    }
}

// Get batch by ID
export const getBatchById = async (req, res) => {
    try {
      const batch = await Batch.findById(req.params.id)
        .populate("course")
        .populate("coach", "-password")
        .populate("students");
  
      if (!batch) return res.status(404).json({ message: "Batch not found" });
      res.status(200).json(batch);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  

// Update batch
export const updateBatch = async (req, res) => {
    try {
      const updated = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };


// Delete batch
export const deleteBatch = async (req, res) => {
    try {
      await Batch.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: "Batch deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };