import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Map,LeafIcon, tileLayer, marker, icon,polyline ,geoJSON, removeLayers, LayerGroup } from 'leaflet';
import { Platform } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Toast } from '@ionic-native/toast/ngx';
import { PathService } from '../shared/services/path.service';
import { PoiService } from '../shared/services/poi.service';
@Component({
    selector: 'app-pathId',
    templateUrl: 'pathId.page.html',
    styleUrls: ['pathId.page.scss']
  })
  export class PathIdPage {
    icons= {
      greenIcon : icon({
        iconUrl: '/assets/pref-2/green-s.png',
        iconSize: [25, 25], 
        popupAnchor: [0, -20]
      }),
      redIcon : icon({
        iconUrl: '/assets/pref-2/red-s.png',
        iconSize: [25, 25],  
        popupAnchor: [0, -20]
      })
    }
    pathSelected
    poisList=[]
    pointsPath=[]
    currentFilter
    layerGroup 
    map: Map
    constructor(
      private route: ActivatedRoute,
      public plt: Platform,
      private sqlite: SQLite,
      private toast: Toast,
      public router: Router,
      public pathService: PathService,
      private poiService: PoiService,){
        //this.initMap()
    }

    
  ionViewDidEnter(){

    this.plt.ready().then(() => {
      
      if(this.map) {
        this.map.removeLayer(this.layerGroup);
        this.map.remove()
      }
      this.initMap()
    });
  }

    
  initMap() {
    this.map = new Map('map-pathId').setView([39.21834898953833,9.1126227435], 12.5);

    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);


    this.layerGroup = new LayerGroup();
    this.layerGroup.addTo(this.map);

    this.map.invalidateSize();

    /*
    this.sqlite.create({
      name: 'filters.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {
        
        db.executeSql(`select * from paths`,[])
        .then((tableSelect)=>{
          
          if (tableSelect.rows.length > 0) {
            for (var i = 0; i < tableSelect.rows.length; i++) {
              
              
              if(tableSelect.rows.item(i).rowid == this.route.snapshot.params.id){
                
                
                this.pointsPath[0]=JSON.parse(tableSelect.rows.item(i).coordinates)[0]
                   
                this.layerGroup.addLayer(marker([this.pointsPath[0].lat, this.pointsPath[0].lng], {icon: this.icons.greenIcon}));
                
                this.pointsPath[1]=JSON.parse(tableSelect.rows.item(i).coordinates)[1]
                this.layerGroup.addLayer(marker([this.pointsPath[1].lat, this.pointsPath[1].lng], {icon: this.icons.redIcon}));
                
                this.currentFilter=JSON.parse(tableSelect.rows.item(i).filter)
                //this.showPath(this.pointsPath[0],this.pointsPath[1],JSON.parse(tableSelect.rows.item(i).filter).value)
                
              }
              
            }
          }
        })
        .catch((e) => {
          this.toast.show(JSON.stringify(e), '3000', 'center').subscribe(
            toast => {
              console.log(toast);
          })
        })
      })*/
  }

  
  getShowPath(){
    this.map.fitBounds([
      [this.pointsPath[0].lat, this.pointsPath[0].lng],
      [this.pointsPath[1].lat, this.pointsPath[1].lng]
    ]);
    
    let pointStart= this.pointsPath[0].lat + "," +this.pointsPath[0].lng
    let pointEnd= this.pointsPath[1].lat + "," +this.pointsPath[1].lng
      //const element = this.filterListService.getFilterObject()[index];
      this.pathService.getPath(pointStart,pointEnd,this.currentFilter.value)
      .subscribe(
          posts => {
            let newGeometry = posts.geometry.replace("[","");
            newGeometry = newGeometry.replace("]","");
            newGeometry = newGeometry.replace(/ /g,"|");
            newGeometry = newGeometry.replace("|","");	
        
            // 2. split sulle virgole:
            let geometryArray1Dim = newGeometry.split(",");    
        
            // 3. crea array bidimesionale:
            let geometryArray2Dim = Array.from(Array(geometryArray1Dim.length), () => new Array(2));
        
            // 4. popola array: per ogni elemento del precedente array, split su |:    
            for(let i=0; i<geometryArray1Dim.length; i++)
            {
              let tempArray = geometryArray1Dim[i].split("|");
              for(let j=0; j<2; j++)
              {
                geometryArray2Dim[i][0] = parseFloat(tempArray[0]);
                geometryArray2Dim[i][1] = parseFloat(tempArray[1]);
              }
            }
  
            let newPointList = posts.nodes.replace("[","");
            newPointList = newPointList.replace("]","");
        
            // 2. split sulle virgole:
            let PointList1Dim = newPointList.split(",");

            geoJSON({
              "type": "LineString", 
              "coordinates": geometryArray2Dim,
            })
          
            this.layerGroup.addLayer(geoJSON({
              "type": "LineString", 
              "coordinates": geometryArray2Dim,
            }).bindPopup('<h1>'+this.currentFilter.name+'</h1>'));

          },
          error => {
            this.toast.show(JSON.stringify(error), '3000', 'center').subscribe(
              toast => {
                console.log(this.pointsPath);
            })
          });

  }
}   