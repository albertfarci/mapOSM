import { Component } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Toast } from '@ionic-native/toast/ngx';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { PreferitiService } from '../shared/services/preferiti.service';

@Component({
  selector: 'app-path',
  templateUrl: 'path.page.html',
  styleUrls: ['path.page.scss']
})
export class PathPage {

  filter;
  pathsSaved = [];
  pathFiltered =[]

  
  carNamedColor = "light";
  walkNamedColor = "light";
  namedColor = "light";
  touristColor="light";
  fitnessColor="light";
  oldAgeColor="light";
  familyColor="light"

  carDisabled = false
  walkDisabled = false
  namedDisabled = false
  touristDisabled=false;
  fitnessDisabled=false;
  oldAgeDisabled=false;
  familyDisabled=false

  paths = {
    "0": {
      "value": 0,
      "name": "Car"
    },
    "1": {
      "value": 1,
      "name": "Foot"
    },
    "2": {
      "value": 2,
      "name": "Bycicle"
    },
    "3": {
      "value": 3,
      "name": "Car by Speed"
    },
    "4": {
      "value": 4,
      "name": "Fitness"
    },
    "5": {
      "value": 5,
      "name": "Bycicle co2"
    },
    "6":{
      "value": 6,
      "name": "Anziani"
    },
    "7":{
      "value":7,
      "name":"Famiglie"
    },
    "8":{
      "value":8,
      "name":"Turistico"
    }
  }

  constructor(
    public plt: Platform,
    private sqlite: SQLite,
    private toast: Toast,
    public router: Router,
    public preferitiService: PreferitiService) {
  }

  ionViewDidEnter(){
    
    this.carNamedColor = "light";
    this.walkNamedColor = "light";
    this.namedColor = "light";
    this.touristColor="light";
    this.fitnessColor="light";
    this.oldAgeColor="light";
    this.familyColor="light"

    this.carDisabled = false
    this.walkDisabled = false
    this.namedDisabled = false
    this.touristDisabled=false;
    this.fitnessDisabled=false;
    this.oldAgeDisabled=false;
    this.familyDisabled=false
    
    this.plt.ready().then(() => {
      this.pathsSaved = []
      this.pathFiltered=[]
      if(this.preferitiService.preferito.value){
        switch(this.preferitiService.preferito.value) {
          case 2:
            // code block
            this.filterBicycle()
            break;
          case 4:
            this.filterFitness()
            break;
          case 8:
            this.filterTourist()
            break;
        }
      }
    });
  }

  
  goToPathId(filter){
    this.router.navigate(['/tabs/pathId', JSON.parse(filter)]);
  }
  
  filterCar(){
    if(this.carNamedColor=="light"){

      this.carNamedColor="secondary"
      this.namedDisabled=true
      this.walkDisabled=true
      this.touristDisabled=true
      this.familyDisabled=true
      this.oldAgeDisabled=true
      this.fitnessDisabled=true
      this.sqlite.create({
        name: 'filters.db',
        location: 'default'
      })
        .then((db: SQLiteObject) => {
          
          db.executeSql(`select * from paths`,[])
          .then((tableSelect)=>{
            
            if (tableSelect.rows.length > 0) {
              
              for (var i = 0; i < tableSelect.rows.length; i++) {
                if(JSON.parse(tableSelect.rows.item(i).filter).name == "Car"){
                  this.pathFiltered.push(tableSelect.rows.item(i))
                }
              }

            }
          })


          .catch((e) => {
            
          })
        })
  
    }else{
      
      this.carNamedColor="light"
      this.namedDisabled=false
      this.walkDisabled=false
      this.touristDisabled=false
      this.familyDisabled=false
      this.oldAgeDisabled=false
      this.fitnessDisabled=false
      this.pathFiltered=[]
    }

    }

    filterFamily(){
      if(this.familyColor=="light"){
  
        this.familyColor="secondary"
        this.namedDisabled=true
        this.walkDisabled=true
        this.carDisabled=true
        this.touristDisabled=true
        this.oldAgeDisabled=true
        this.fitnessDisabled=true
                                this.sqlite.create({
                                  name: 'filters.db',
                                  location: 'default'
                                })
                                  .then((db: SQLiteObject) => {
                                    
                                    db.executeSql(`select * from paths`,[])
                                    .then((tableSelect)=>{
                                      
                                      if (tableSelect.rows.length > 0) {
                                        
                                        for (var i = 0; i < tableSelect.rows.length; i++) {
                                          if(JSON.parse(tableSelect.rows.item(i).filter).name == "Famiglie"){
                                            this.pathFiltered.push(tableSelect.rows.item(i))
                                          }
                                        }
                          
                                      }
                                    })
                          
                          
                                    .catch((e) => {
                                      
                                    })
                                  })
      }else{
        
        this.familyColor="light"
        this.namedDisabled=false
        this.walkDisabled=false
        this.carDisabled=false
        this.touristDisabled=false
        this.oldAgeDisabled=false
        this.fitnessDisabled=false
        this.pathFiltered=[]
      }
  
      }

    filterTourist(){
      if(this.touristColor=="light"){
  
        this.touristColor="secondary"
        this.namedDisabled=true
        this.walkDisabled=true
        this.carDisabled=true
        this.familyDisabled=true
        this.oldAgeDisabled=true
        this.fitnessDisabled=true
        this.sqlite.create({
          name: 'filters.db',
          location: 'default'
        })
          .then((db: SQLiteObject) => {
            
            db.executeSql(`select * from paths`,[])
            .then((tableSelect)=>{
              
              if (tableSelect.rows.length > 0) {
                
                for (var i = 0; i < tableSelect.rows.length; i++) {
                  if(JSON.parse(tableSelect.rows.item(i).filter).name == "Turistico"){
                    this.pathFiltered.push(tableSelect.rows.item(i))
                  }
                }
  
              }
            })
  
  
            .catch((e) => {
              
            })
          })
    
      }else{
        
        this.touristColor="light"
        this.namedDisabled=false
        this.walkDisabled=false
        this.carDisabled=false
        this.familyDisabled=false
        this.oldAgeDisabled=false
        this.fitnessDisabled=false
        this.pathFiltered=[]
      }
  
      }

      filterOldAge(){
        if(this.oldAgeColor=="light"){
    
          this.oldAgeColor="secondary"
          this.namedDisabled=true
          this.walkDisabled=true
          this.carDisabled=true
          this.familyDisabled=true
          this.touristDisabled=true
          this.fitnessDisabled=true
          this.sqlite.create({
            name: 'filters.db',
            location: 'default'
          })
            .then((db: SQLiteObject) => {
              
              db.executeSql(`select * from paths`,[])
              .then((tableSelect)=>{
                
                if (tableSelect.rows.length > 0) {
                  
                  for (var i = 0; i < tableSelect.rows.length; i++) {
                    if(JSON.parse(tableSelect.rows.item(i).filter).name == "Anziani"){
                      this.pathFiltered.push(tableSelect.rows.item(i))
                    }
                  }
    
                }
              })
    
    
              .catch((e) => {
                
              })
            })
      
        }else{
          
          this.oldAgeColor="light"
          this.namedDisabled=false
          this.walkDisabled=false
          this.carDisabled=false
          this.familyDisabled=false
          this.touristDisabled=false
          this.fitnessDisabled=false
          this.pathFiltered=[]
        }
    
        }

    filterFitness(){
      if(this.fitnessColor=="light"){
  
        this.fitnessColor="secondary"
        this.namedDisabled=true
        this.walkDisabled=true
        this.carDisabled=true
        this.familyDisabled=true
        this.touristDisabled=true
        this.oldAgeDisabled=true
        this.sqlite.create({
          name: 'filters.db',
          location: 'default'
        })
          .then((db: SQLiteObject) => {
            
            db.executeSql(`select * from paths`,[])
            .then((tableSelect)=>{
              
              if (tableSelect.rows.length > 0) {
                
                for (var i = 0; i < tableSelect.rows.length; i++) {
                  if(JSON.parse(tableSelect.rows.item(i).filter).name == "Fitness"){
                    this.pathFiltered.push(tableSelect.rows.item(i))
                  }
                }
  
              }
            })
  
  
            .catch((e) => {
              
            })
          })
    
      }else{
        
        this.fitnessColor="light"
        this.namedDisabled=false
        this.walkDisabled=false
        this.carDisabled=false
        this.familyDisabled=false
        this.touristDisabled=false
        this.oldAgeDisabled=false
        this.pathFiltered=[]
      }
  
      }

  filterFoot(){
    if(this.walkNamedColor=="light"){

      this.walkNamedColor="secondary"
      this.namedDisabled=true
      this.carDisabled=true
      this.touristDisabled=true
      this.familyDisabled=true
      this.oldAgeDisabled=true
      this.fitnessDisabled=true
      this.sqlite.create({
        name: 'filters.db',
        location: 'default'
      })
        .then((db: SQLiteObject) => {
          
          db.executeSql(`select * from paths`,[])
          .then((tableSelect)=>{
            
            if (tableSelect.rows.length > 0) {
              
              for (var i = 0; i < tableSelect.rows.length; i++) {
                if(JSON.parse(tableSelect.rows.item(i).filter).name == "Foot"){
                  this.pathFiltered.push(tableSelect.rows.item(i))
                }
              }

            }
          })


          .catch((e) => {
            
          })
        })
  
    }else{
      
      this.walkNamedColor="light"
      this.namedDisabled=false
      this.carDisabled=false
      this.touristDisabled=false
      this.familyDisabled=false
      this.oldAgeDisabled=false
      this.fitnessDisabled=false
      this.pathFiltered=[]
    }

    }

  filterBicycle(){
    if(this.namedColor=="light"){

      this.namedColor="secondary"
      this.walkDisabled=true
      this.carDisabled=true
      this.touristDisabled=true
      this.familyDisabled=true
      this.oldAgeDisabled=true
      this.fitnessDisabled=true
      this.sqlite.create({
        name: 'filters.db',
        location: 'default'
      })
        .then((db: SQLiteObject) => {
          
          db.executeSql(`select * from paths`,[])
          .then((tableSelect)=>{
            
            if (tableSelect.rows.length > 0) {
              
              for (var i = 0; i < tableSelect.rows.length; i++) {
                if(JSON.parse(tableSelect.rows.item(i).filter).name == "Bycicle"){
                  this.pathFiltered.push(tableSelect.rows.item(i))
                }
              }

            }
          })


          .catch((e) => {
            
          })
        })
    }else{
      
      this.namedColor="light"
      this.walkDisabled=false
      this.carDisabled=false
      this.touristDisabled=false
      this.familyDisabled=false
      this.oldAgeDisabled=false
      this.fitnessDisabled=false
      this.pathFiltered=[]
    }

    }

}
