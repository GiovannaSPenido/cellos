import DomainException from './DomainException'

/**
 * A record the caller referred to does not exist. Separated from
 * DomainException so the API can answer 404 rather than 400 — the request was
 * well formed, the thing it pointed at simply is not there.
 */
export class NotFoundException extends DomainException {
  constructor(what: string, id?: string) {
    super(id ? `${what} ${id} was not found` : `${what} was not found`)
    this.name = 'NotFoundException'
  }
}

export default NotFoundException
