import { Component } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Toast } from '@ionic-native/toast/ngx';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-path',
  templateUrl: 'path.page.html',
  styleUrls: ['path.page.scss']
})
export class PathPage {

  filter;
  pathsSaved = [];
  constructor(
    public plt: Platform,
    private sqlite: SQLite,
    private toast: Toast,
    public router: Router) {
  }

  ionViewDidEnter(){

    this.plt.ready().then(() => {
      this.pathsSaved = []
      this.sqlite.create({
        name: 'filters.db',
        location: 'default'
      })
        .then((db: SQLiteObject) => {
          
          db.executeSql(`select * from paths`,[])
          .then((tableSelect)=>{
            
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

  
  goToPathId(filter){
    this.router.navigate(['/tabs/pathId', JSON.parse(filter)]);
  }

}
