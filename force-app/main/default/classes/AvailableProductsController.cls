public with sharing class AvailableProductsController {

   static final String  PRICEBOOKENTRYID = 'pricebookEntryId';
   static final String  PRODUCT2ID = 'Product2Id';
   static final String  PRODUCTNAME = 'Name';
   static final String  UNITPRICE = 'UnitPrice';
   static final String  PRICEBOOK2ID = 'Pricebook2Id';
   static final String  ORDERID = 'OrderId';

   @AuraEnabled(cacheable=true)
   public static String getAvailableProducts(String orderId, String pricebook2Id ,String searchKey, String sortBy, String sortDirection) {
      
       String query = 'SELECT Id, Product2.Id, Product2.Name, UnitPrice FROM PriceBookEntry WHERE Pricebook2Id IN (SELECT Id FROM PriceBook2 WHERE id=:pricebook2Id)';

       if ( searchKey != null && searchKey != '' ) {
           String key = '%' + searchKey + '%';
           query += ' AND Product2.Name LIKE :key';
       }
       if ( sortBy != null && sortDirection != null ) {
           query += ' ORDER BY ' + sortBy + ' ' + sortDirection;
       }
       Map<Id, Map<String,String>> uniqueProducts = new Map<Id, Map<String,String>>();

       for(PriceBookEntry pBE: Database.query(query)){
           /*
            The exercise acceptance criteria ask us to show only one product, 
            This loop is to filter all the unique values.
           */
            uniqueProducts.put(pBE.Product2.Id, new Map<String, String>{
                PRICEBOOKENTRYID => pBE.Id,
                PRODUCT2ID => pBE.Product2.Id,
                PRODUCTNAME => pBE.Product2.Name,
                UNITPRICE => string.valueOf(pBE.UnitPrice)
            });
       }      

       List <Map<String, String>> uniqueListOfProducts= uniqueProducts.values();
       List <Map<String, String>> listOfProductsAlreadyAdded= new List <Map<String, String>>();
       List <Map<String, String>> listOfProductsNotAdded= new List <Map<String, String>>();

       List<OrderItem> listOfProductsInOrder = [SELECT PricebookEntry.Product2.Id FROM OrderItem where OrderId=:orderId];

       for(Map<String, String> productMap : uniqueListOfProducts){
            /*
                We filter the products that are already in the order
            */
            Boolean isAdded=false;
            for(OrderItem oI:listOfProductsInOrder){
                if(oI.PricebookEntry.Product2.Id == productMap.get(PRODUCT2ID)){
                    listOfProductsAlreadyAdded.add(productMap);
                    isAdded=true;
                }
            }
            /*
                If the product has never been added, then we put it in another list
            */
            if(!isAdded){
                listOfProductsNotAdded.add(productMap);
            }
        }

        List <Map<String, String>> listOfOrderedProducts= new List <Map<String, String>>();
        listOfOrderedProducts.addAll(listOfProductsAlreadyAdded);
        listOfOrderedProducts.addAll(listOfProductsNotAdded);

       return JSON.serialize(listOfOrderedProducts);
   }

    @AuraEnabled
    public static OrderItem addProductToOrder(Map<String, String> data) {

        String pricebookEntryId = data.get(PRICEBOOKENTRYID);
        String productId = data.get(PRODUCT2ID);
        String unitPrice = data.get(UNITPRICE);
        String pricebookId = data.get(PRICEBOOK2ID);
        String orderId = data.get(ORDERID);

        List<orderItem> orderItemList = [SELECT Id, OrderId, PricebookEntryId, Product2Id, Quantity FROM OrderItem WHERE orderId=:orderId AND PricebookEntryId =:pricebookEntryId];

        Boolean productAlreadyInOrder = orderItemList.size() > 0;

        OrderItem upsertedOrderItem = new OrderItem();

        if(productAlreadyInOrder){
            upsertedOrderItem = orderItemList[0];
            upsertedOrderItem.Quantity = upsertedOrderItem.Quantity.intValue() + 1;
            Update (upsertedOrderItem);
        }else{
            upsertedOrderItem.OrderId = orderId;
            upsertedOrderItem.Product2Id = productId;
            upsertedOrderItem.Quantity = 1;
            upsertedOrderItem.PriceBookEntryId = pricebookEntryId;
            //We check the pricebookEntry UnitPrice as this a sensible data and should not be trusted from the frontend
            List<PriceBookEntry> entryList = [SELECT UnitPrice FROM PriceBookEntry WHERE Id=:pricebookEntryId];
            upsertedOrderItem.UnitPrice = entryList[0].UnitPrice;
            insert upsertedOrderItem;
        }
        
        return upsertedOrderItem;
    }
   
}
