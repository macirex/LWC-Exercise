@isTest
private with sharing class AvailableProductsControllerTest {
    
    @isTest static void testGetAvailableProducts(){
        MockDataOrder data = new MockDataOrder();

        String response = AvailableProductsController.getAvailableProducts(data.order.id, data.pricebookId ,'T', 'Product2.Name', 'ASC');
		Boolean result=response.contains('[]');
        /* 
            I really wanted to test it better
        */
        System.assert(result);
    }

    static final String  PRICEBOOKENTRYID = 'pricebookEntryId';
    static final String  PRODUCT2ID = 'Product2Id';
    static final String  PRODUCTNAME = 'Name';
    static final String  UNITPRICE = 'UnitPrice';
    static final String  PRICEBOOK2ID = 'Pricebook2Id';
    static final String  ORDERID = 'OrderId';

    @isTest static void addProductToOrder(){

     
        MockDataOrder data = new MockDataOrder();

        Map<String, String> dataProductToOrder = new Map<String, String>();

        String pricebookEntryId = dataProductToOrder.put(PRICEBOOKENTRYID, data.standardPrice.Id);
        String productId = dataProductToOrder.put(PRODUCT2ID, data.product.Id);
        String unitPrice = dataProductToOrder.put(UNITPRICE, String.valueOf(data.standardPrice.UnitPrice));
        String pricebookId = dataProductToOrder.put(PRICEBOOK2ID, data.pricebookId);
        String orderId = dataProductToOrder.put(ORDERID, data.order.Id);

        OrderItem oi = AvailableProductsController.addProductToOrder(dataProductToOrder);
        System.assert(oi.Quantity> 1);
    }

    @isTest static void addProductToOrderWithNoRepeatedProduct(){

     
        MockDataOrder data = new MockDataOrder(false);

        Map<String, String> dataProductToOrder = new Map<String, String>();

        String pricebookEntryId = dataProductToOrder.put(PRICEBOOKENTRYID, data.standardPrice.Id);
        String productId = dataProductToOrder.put(PRODUCT2ID, data.product.Id);
        String unitPrice = dataProductToOrder.put(UNITPRICE, String.valueOf(data.standardPrice.UnitPrice));
        String pricebookId = dataProductToOrder.put(PRICEBOOK2ID, data.pricebookId);
        String orderId = dataProductToOrder.put(ORDERID, data.order.Id);

        OrderItem oi = AvailableProductsController.addProductToOrder(dataProductToOrder);
        System.assertEquals(oi.Quantity, 1);
    }
}