import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Path } from '../models/path.model';

@Injectable()
export class PathService {

    geometryPath:[]

    constructor(private http: HttpClient) { }
    
    getPath(pointStart, pointEnd, filter) {
        return this.http.get<any>(`http://156.148.14.188:8080/v1/requestTrip/31-12-2001/`+ pointStart + '/'+ pointEnd + '/'+ filter )
    }

    
}