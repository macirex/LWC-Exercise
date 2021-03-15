import { LightningElement, api, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getOrderProducts from '@salesforce/apex/OrderProductsController.getOrderProducts';
import updateExternalRecord from '@salesforce/apex/OrderProductsController.updateExternalRecord';

import Status from '@salesforce/schema/order.Status';
import AccountId from '@salesforce/schema/order.AccountId';
import Type from '@salesforce/schema/order.Type';
import Id from '@salesforce/schema/order.Id';

import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import orderProductMessageChannel from '@salesforce/messageChannel/orderProduct__c';
import {subscribe, MessageContext} from 'lightning/messageService'

    const FIELDS = [
        Status,
        AccountId,
        Id,
        Status,
        Type
    ];

    const columns = [
        {
            label: 'Name',
            fieldName: 'Name',
            type: 'text',
            sortable: true
        },
        {
            label: 'Unit Price',
            fieldName: 'UnitPrice',
            sortable: true,
            type: 'currency',
            typeAttributes: { currencyCode: 'EUR', step: '0.001'}
        },
        {
            label: 'Quantity',
            fieldName: 'Quantity',
            sortable: true,
            type: 'number'
        },
        {
            label: 'Total Price',
            fieldName: 'TotalPrice',
            sortable: true,
            type: 'currency',
            typeAttributes: { currencyCode: 'EUR', step: '0.001'}
        },
        
        ];
        
export default class OrderProducts extends LightningElement {

    @api recordId;
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    order;

    @track value;
    @track error;

    //I know that track is deprecated on the latest LWC release, but I got used to see it, that's why I still use it.

    @api sortedDirection = 'asc';
    @api sortedBy = 'Name';
   
    @track data = []; 
    @track columns; 
    @track subscription = null;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.handleSubscribe();
    }
    
    handleSubscribe() {
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(this.messageContext, orderProductMessageChannel, (message) => {
            this.selfRefresh();
        });
    }

    @track wiredOrderProducts;

    @wire(getOrderProducts, {   orderId: '$recordId' 
        ,sortBy: '$sortedBy', sortDirection: '$sortedDirection'})
        getOrderProductsCallback(response) {
        this.wiredOrderProducts = response;
        const data = response.data;
        const error = response.error; 
        if (data) {
            let jsonData= JSON.parse(data);
            this.data = jsonData;
            this.columns = columns;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.data = undefined;
        }
    }

    sortColumns( event ) {
        this.sortedBy = event.detail.fieldName;
        this.sortedDirection = event.detail.sortDirection;
        return this.selfRefresh();
        
    }

    clickHandler(){
        const fields = {};
        fields[Id.fieldApiName] = this.recordId;
        fields[Status.fieldApiName] = 'Activated';
        fields[StatusCode.fieldApiName] = 'Activated';

        const orderRecord = { fields };
        debugger;
        updateRecord(orderRecord)
                .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Order Activated',
                            variant: 'success'
                        })
                    );

                    /* I should of have made a controller to update the record and then do the HTTP call to an
                        external system, but when I designed the components the first time I did the record update this way
                        and I dedicded to leave it like it is in order to deliver this ASAP
                    */
                    this.updateOnExternalSystem();
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Order could not be activated',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                });
    }
  
    get isActive() {    
        return getFieldValue(this.order.data, Status) == 'Activated';
    }

    selfRefresh =()=>{
        return refreshApex(this.wiredOrderProducts);
    }

    updateOnExternalSystem= ()=>{
 
        let orderProducts = [];
            debugger;
        this.data.forEach( productEntry => {
            orderProducts.push(
                {
                    name: productEntry.Name,
                    code: productEntry.Id,
                    unitPrice: productEntry.UnitPrice,
                    quantity: productEntry.Quantity
                }
            )
        })

        let jsonData = {
            accountNumber: this.order.data.fields.AccountId.value,
            orderNumber: this.order.data.fields.Id.value,
            type:  this.order.data.fields.Type.value,
            status: this.order.data.fields.Status.value,
            orderProducts: orderProducts
        }

        updateExternalRecord({jsonData :JSON.stringify(jsonData)}).then((response) => {
            debugger;
            if(response.success=="true"){
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Update request was successful',
                        message: 'External record updated successfully',
                        variant: 'success'
                    })
                );
            }else{
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Update request failed',
                        message: 'External record update error',
                        variant: 'error'
                    })
                );
            }

        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Request failed',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
    }
}