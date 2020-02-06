import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx'
import { Toast } from '@ionic-native/toast/ngx'

@Injectable()
export class StorageService {

    constructor(private sqlite: SQLite, private toast: Toast) {
    }

    getPathFromStorage(): [] {
        this.toast.show("getPathFromStorage", '3000', 'center').subscribe(
            toast => {
                console.log(toast);
            })

        var pathFromStorage: [] = []

        this.sqlite.create({
            name: 'filters.db',
            location: 'default'
        }).then((dbObject: SQLiteObject) => {

            return dbObject.executeSql(`select * from paths`, [])
                .then((tableSelect) => {

                    if (tableSelect.rows.length > 0) {

                        for (var i = 0; i < tableSelect.rows.length; i++) {
                            pathFromStorage.push(tableSelect.rows.item(i))
                        }

                    }
                    return pathFromStorage
                })
                .catch((e) => {
                    this.toast.show("Error", '3000', 'center').subscribe(
                        toast => {
                            console.log(toast);
                        })

                    return e
                })
        })
    }
}