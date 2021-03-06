import { Message } from './../models/message';
import { map } from 'rxjs/operators';
import { PaginatedResult } from './../models/pagination';
import { environment } from './../../environments/environment';
import { User } from './../models/user';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class UserService {
    baseUrl = environment.apiUrl + 'users/'
    mainPhotoUpdated = new Subject<any>()
    constructor(private http: HttpClient) { }

    getUsers(page?, itemsPerPage?, userParams?, created?, likeParams?): Observable<PaginatedResult<User[]>> {
        const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<User[]>()
        var params = new HttpParams()
        if (page != null && itemsPerPage != null) {
            params = params.append("pageSize", itemsPerPage)
            params = params.append("pageNumber", page)
        }
        if (userParams != null) {
            params = params.append("minAge", userParams.minAge)
            params = params.append("maxAge", userParams.maxAge)
            params = params.append("gender", userParams.gender)
        }
        if (created != null)
            params = params.append("orderBy", created)
        if (likeParams == 'Likees')
            params = params.append("likees", "true")
        if (likeParams == 'Likers')
            params = params.append("likers", "true")
        return this.http.get<User[]>(this.baseUrl, { observe: 'response', params }).pipe(
            map(response => {
                paginatedResult.result = response.body
                if (response.headers.get("Pagination") != null)
                    paginatedResult.pagination = JSON.parse(response.headers.get("Pagination"))
                return paginatedResult
            })
        )
    }

    getUser(id: number): Observable<User> {
        return this.http.get<User>(this.baseUrl + id)
    }

    updateUser(id: number, user: User) {
        return this.http.put(this.baseUrl + id, user)
    }

    setMainPhoto(userId: number, id: number) {
        return this.http.post(this.baseUrl + userId + '/photos/' + id + '/setMain', {})
    }

    deletePhoto(userId: number, id: number) {
        return this.http.delete(this.baseUrl + userId + '/photos/' + id)
    }

    sendLike(id: number, recipientId: number) {
        return this.http.post(this.baseUrl + id + '/like/' + recipientId, {})
    }

    getUserMessages(id?, pageSize?, pageNumber?, messageContainer?) {
        const paginatedResult: PaginatedResult<Message[]> = new PaginatedResult<Message[]>()
        var params = new HttpParams()
        params = params.append("messageContainer", messageContainer)
        if (pageSize != null && pageNumber != null) {
            params = params.append("pageSize", pageSize)
            params = params.append("pageNumber", pageNumber)
        }
        return this.http.get<Message[]>(this.baseUrl + id + '/messages', { observe: 'response', params }).pipe(
            map(response => {
                paginatedResult.result = response.body
                if (response.headers.get("Pagination") != null)
                    paginatedResult.pagination = JSON.parse(response.headers.get("Pagination"))
                return paginatedResult
            })
        )
    }

    getUserMessagesThread(id: number, recipientId: number){
        return this.http.get<Message[]>(this.baseUrl + id + "/messages/thread/" + recipientId)
    }

    sendMessage(id: number, message: Message){
        return this.http.post(this.baseUrl + id + '/messages', message)
    }

    deleteMessage(id: number, userId: number){
        return this.http.post(this.baseUrl + userId + "/messages/" + id, {})
    }

    markMessageAsRead(id: number, userId: number){
        return this.http.post(this.baseUrl + userId + '/messages/' + id + '/read', {})
    }
}