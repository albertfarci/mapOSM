import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Platform } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Toast } from '@ionic-native/toast/ngx';

@Component({
  selector: 'app-percorso',
  templateUrl: 'percorso.page.html'
})
export class PercorsoPage {

  pathsSaved: any[];
  constructor(
    public route: ActivatedRoute,
    public plt: Platform,
    private sqlite: SQLite,
    private toast: Toast
  ) {
    this.route.params.subscribe(params => {
      params.id; // --> Name must match wanted parameter
    });
  }


  ionViewDidEnter() {

    this.plt.ready().then(() => {
      this.pathsSaved = []
      this.sqlite.create({
        name: 'filters.db',
        location: 'default'
      })
        .then((db: SQLiteObject) => {

          db.executeSql(`select * from paths`, [])
            .then((tableSelect) => {

              if (tableSelect.rows.length > 0) {

                for (var i = 0; i < tableSelect.rows.length; i++) {

                  this.pathsSaved.push(tableSelect.rows.item(i))
                }
              }

            })
            .catch((e) => {
              this.toast.show(JSON.stringify(e), '3000', 'center').subscribe(
                toast => {
                  console.log(toast);
                })
            })
        })
    });
  }
}