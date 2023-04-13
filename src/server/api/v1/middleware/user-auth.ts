import { ForbiddenError, UnauthorizedError } from '../../../errors';
import { NextFunction, Request, Response } from 'express';
import { config } from '../../../../config'
import jwt from 'jsonwebtoken'

function userAuth(req: Request, res: Response, next: NextFunction): void {
	if (!req.cookies.userID) {
		throw new UnauthorizedError('Authenticate yourself.')
	}

	interface JwtPayload extends jwt.JwtPayload {
		userID?: string;
	}
	
	const idJWT: string | JwtPayload = jwt.verify(req.cookies.userID, config.jwtSecret!)

	if (!idJWT || typeof idJWT === 'string' || !idJWT.userID) {
		throw new UnauthorizedError('Authenticate yourself.')
	}

	req.userID = idJWT.userID

	if (!config.adminIDs.includes(req.userID)) {
		throw new ForbiddenError('You are not an admin.')
	}

	next()
}

export default userAuth