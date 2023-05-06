import { BadGatewayError, BadRequestError, InternalServerError } from '../../../errors';
import { TicketModel } from '../../../db/models';
import { Request, Response } from 'express';
require('express-async-errors')

async function getTickets(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page) || 0
    const status = req.query.status

    if (!Number.isSafeInteger(page) || page < 0) {
        throw new BadRequestError('Page is invalid.')
    }

    if (status && ['closed', 'open'].includes(String(status))) {
        throw new BadGatewayError('Invalid status.')
    }

    const tickets = await TicketModel.find(status ? { status } : {})
    .skip(page * 10).limit(10).select('-text').lean()
    .catch(err => {
        throw new InternalServerError('Could not get user ids.')
    })

    res.status(200).json(tickets)
}

async function getTicket(req: Request, res: Response): Promise<void> {
    const { ticketID } = req.params

    const ticket = await TicketModel.findById(ticketID).lean()

    res.status(200).json(ticket)
}

export {
    getTickets,
    getTicket,
}