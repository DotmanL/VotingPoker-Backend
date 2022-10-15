import { Schema, model } from 'mongoose';
import { IRoom } from './IRoom';


const roomSchema = new Schema<IRoom>({
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32,
        unique: true
    },
    id: {
        type: String,
        required: true
    },
    votingSystem: {
        type: Number,
    },

});

const RoomSchema = model<IRoom>("Room", roomSchema);
export { RoomSchema }