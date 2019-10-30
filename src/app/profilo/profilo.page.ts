import { Component } from '@angular/core';
import { DatePicker } from '@ionic-native/date-picker/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Toast } from '@ionic-native/toast/ngx';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-profilo',
  templateUrl: 'profilo.page.html',
  styleUrls: ['profilo.page.scss']
})
export class ProfiloPage {

  formFilters : FormGroup;
  sqliteHelper: Promise<SQLiteObject>;
  filtersRow= {
    "piedi": false,
    "bici": false,
    "auto": false,
    "turisti": false,
    "fitness": false,
    "famiglia": false,
    "anziani": false,
    "disabilita": false
  };
  database: SQLiteObject
  success:any

  constructor(
    private datePicker: DatePicker,
    private sqlite: SQLite,
    private formBuilder: FormBuilder,
    private toast: Toast) {  

      this.formFilters = this.formBuilder.group({
        turisti: [null,Validators.required],
        fitness: [null,Validators.required],
        famiglia: [null,Validators.required],
        anziani: [null,Validators.required],
        disabilita: [null,Validators.required]
      });
      
      this.sqlite.create({
        name: 'filters.db',
        location: 'default'
      })
        .then((db: SQLiteObject) => {
          this.database=db
          this.createDatabase()
        })
        
    }

  showDatePicker(){
    this.datePicker.show({
      date: new Date(),
      mode: 'date',
      androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
    }).then(
      date => console.log('Got date: ', date),
      err => console.log('Error occurred while getting date: ', err)
    );
  }

  createDatabase(){

    this.database.executeSql(`
    CREATE TABLE IF NOT EXISTS filtersProfile(
      rowid INTEGER PRIMARY KEY, 
      turisti TEXT,
      fitness TEXT,
      famiglia TEXT,
      anziani TEXT,
      disabilita TEXT)`, [])
    .then((createTable)=>{
      this.database.executeSql(`select * from filtersProfile`,[])
      .then((resultSelect)=>{

        if(resultSelect.rows.length > 0) {
          this.toast.show(JSON.stringify(JSON.parse(resultSelect.rows.item(0).turisti)+
          JSON.parse(resultSelect.rows.item(0).fitness)+
          JSON.parse(resultSelect.rows.item(0).famiglia)+
          JSON.parse(resultSelect.rows.item(0).anziani)+
          JSON.parse(resultSelect.rows.item(0).disabilita)), '3000', 'center').subscribe(
            toast => {
              console.log(toast);
          })
          this.formFilters.controls.turisti.setValue(JSON.parse(resultSelect.rows.item(0).turisti))
          this.formFilters.controls.fitness.setValue(JSON.parse(resultSelect.rows.item(0).fitness))
          this.formFilters.controls.famiglia.setValue(JSON.parse(resultSelect.rows.item(0).famiglia))
          this.formFilters.controls.anziani.setValue(JSON.parse(resultSelect.rows.item(0).anziani))
          this.formFilters.controls.disabilita.setValue(JSON.parse(resultSelect.rows.item(0).disabilita))
          
        }else{
          this.formFilters.controls.turisti.setValue(false)
          this.formFilters.controls.fitness.setValue(false)
          this.formFilters.controls.famiglia.setValue(false)
          this.formFilters.controls.anziani.setValue(false)
          this.formFilters.controls.disabilita.setValue(false)
        }
      })
      .catch((e)=>{
        this.toast.show("Error", '3000', 'center').subscribe(
          toast => {
            console.log(toast);
        })
      })
    })

  }

  savefilters(){
    this.database.executeSql(`
        REPLACE INTO filtersProfile (rowid,turisti,fitness,famiglia,anziani,disabilita)
          VALUES(1,?,?,?,?,?)`, [
            JSON.stringify(this.formFilters.controls.turisti.value),
            JSON.stringify(this.formFilters.controls.fitness.value),
            JSON.stringify(this.formFilters.controls.famiglia.value),
            JSON.stringify(this.formFilters.controls.anziani.value),
            JSON.stringify(this.formFilters.controls.disabilita.value)
          ])
      .then((tableInserted)=>{
        
        this.toast.show("salvatggio avvenuto", '3000', 'center').subscribe(
          toast => {
            console.log(toast);
        })
        
      })
  }

}
