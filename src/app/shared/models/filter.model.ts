export class Filter {
    nome: string
    valore: number
    modalita_figlio: Array<Filter>
    spunta: boolean
}

export abstract class FilterDisable {
    static readonly Piedi: string = 'piedi_disabled';
}

export abstract class FilterColor {
    static readonly Piedi: string = 'walkNamedColor';
}