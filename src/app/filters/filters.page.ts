import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Filter } from '../shared/models/filter.model';
import { FilterListService } from '../shared/services/filters.service';
import { filter } from 'rxjs/operators';
import { SQLiteObject, SQLite } from '@ionic-native/sqlite/ngx';
import { Toast } from '@ionic-native/toast/ngx';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-filters',
  templateUrl: 'filters.page.html',
  styleUrls: ['filters.page.scss']
})
export class FiltersPage {

  formFilters : FormGroup;
  formModalitaFilters : FormGroup;
  filterActive:Filter
  isBiciDIsabled=false
  isPiediDisabled=false
  isMacchinaDIsabled=false
  formDisabled=false

  
  database: SQLiteObject

  constructor(
    public plt: Platform,
    private formBuilder: FormBuilder,
    public router: Router,
    public filterService: FilterListService,
    private sqlite: SQLite,
    private toast: Toast) {
      this.formModalitaFilters = this.formBuilder.group({
        piedi: [null,Validators.required],
        bici: [null,Validators.required],
        macchina: [null,Validators.required],
      });

      
      this.formFilters = this.formBuilder.group({
        turisti: [null,Validators.required],
        fitness: [null,Validators.required],
        famiglia: [null,Validators.required],
        anziani: [null,Validators.required],
        disabilita: [null,Validators.required]
      });

      
      
    }

    

    ionViewDidEnter(){

      this.plt.ready().then(() => {
        this.sqlite.create({
          name: 'filters.db',
          location: 'default'
        })
          .then((db: SQLiteObject) => {
            this.database=db
            this.createDatabase()
          })
      });
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
  setFiltersPath(){
    if(this.formModalitaFilters.controls.piedi.value==true){
      
      this.filterService.removeListFilters()
      this.filterService.setFilterObjct({id:1});
      this.filterService.setFilterObjct({id:4});
    }else if(this.formModalitaFilters.controls.bici.value==true){

      this.filterService.removeListFilters()
      this.filterService.setFilterObjct({id:2});
      this.filterService.setFilterObjct({id:5});
    }else if(this.formModalitaFilters.controls.macchina.value==true){
      
      this.filterService.removeListFilters()
      this.filterService.setFilterObjct({id:3});
      this.filterService.setFilterObjct({id:0});
    }
    this.router.navigate(["/tabs/map"]);
  }

  isPiediSelected(){
    if(this.formModalitaFilters.controls.piedi.value==true){
      this.formDisabled=true
      this.formModalitaFilters.controls.bici.disable()
      this.formModalitaFilters.controls.macchina.disable()
    }else{
      this.formDisabled=false
      this.formModalitaFilters.markAsDirty()
      this.formModalitaFilters.controls.bici.enable()
      this.formModalitaFilters.controls.macchina.enable()
    }
  }

  isBiciSelected(){
    if(this.formModalitaFilters.controls.bici.value==true){
      this.formDisabled=true
      this.formModalitaFilters.controls.piedi.disable()
      this.formModalitaFilters.controls.macchina.disable()
    }else{
      
      this.formDisabled=false
      this.formModalitaFilters.markAsDirty()
      this.formModalitaFilters.controls.piedi.enable()
      this.formModalitaFilters.controls.macchina.enable()
    }
    
  }

  isMacchinaSelected(){
    if(this.formModalitaFilters.controls.macchina.value==true){
      this.formDisabled=true
      this.formModalitaFilters.controls.bici.disable()
      this.formModalitaFilters.controls.piedi.disable()
    }else{
      
      this.formDisabled=false
      this.formModalitaFilters.controls.bici.enable()
      this.formModalitaFilters.controls.piedi.enable()
    }
  }
}
