import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx'
import { Toast } from '@ionic-native/toast/ngx'

@Injectable()
export class StorageService {
    pathFiltered = []

    constructor(private sqlite: SQLite, private toast: Toast) {
    }

    getPathFromStorage(): Promise<any> {

        this.pathFiltered = []
        var pathFromStorage: [] = []
        return new Promise((resolve, reject) => {
            this.sqlite.create({
                name: 'filters.db',
                location: 'default'
            })
                .then((db: SQLiteObject) => {

                    db.executeSql(`select * from paths`, [])
                        .then((tableSelect) => {

                            if (tableSelect.rows.length > 0) {

                                for (var i = 0; i < tableSelect.rows.length; i++) {

                                    this.pathFiltered.push(tableSelect.rows.item(i))
                                }

                                resolve(this.pathFiltered)

                            }
                        })

                })
        })
    }
}