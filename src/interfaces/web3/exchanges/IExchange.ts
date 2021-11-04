export default interface IExchange {
  getReserves(address: string): any

  getPairs(blockBegin: number, blockEnd: number): any
}