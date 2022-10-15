import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { IRoom } from '../models/IRoom';
import { RoomSchema } from '../models/roomSchema'

const router = express.Router()


router.post('/createRoom', [
  body('id').not().isEmpty(),
  body('name').not().isEmpty(),
  body('votingSystem').not().isEmpty(),

], async (req: Request, res: Response) => {

  try {
    const room = new RoomSchema<IRoom>({
      id: req.body.id,
      name: req.body.name,
      votingSystem: req.body.votingSystem
    })

    const roomDetails = await room.save()
    res.json(roomDetails)
  } catch (err: any) {
    console.error(err.message)
    return res.status(500).send('Something went wrong');
  }

})

router.get('/getRoomDetails/:id', async (req: Request, res: Response) => {
  try {
    const room = await RoomSchema.findOne({ id: req.params.id })
    console.log(room, 'req body');
    if (!room) {
      return res.status(404).json({ msg: 'No room found' })
    }
    res.json(room)
  } catch (err: any) {
    console.error(err.message)
    return res.status(500).send('Something went wrong');
  }
})


module.exports = router