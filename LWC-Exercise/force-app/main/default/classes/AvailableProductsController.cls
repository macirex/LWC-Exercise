public with sharing class AvailableProductsController {
   @AuraEnabled(cacheable=true)
   public static String getAvailableProducts(String pricebook2Id ,String searchKey, String sortBy, String sortDirection) {
      
       String query = 'SELECT Product2.Id, Product2.Name, UnitPrice FROM PriceBookEntry WHERE Pricebook2Id IN (SELECT Id FROM PriceBook2 WHERE id=:pricebook2Id)';

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
            not sure how this will work with the unitprice (as one product could have different prices and currency),
            I'll filter all the unique values anyway.
           */
            uniqueProducts.put(pBE.Product2.Id, new Map<String, String>{
                'Id' => pBE.Product2.Id,
                'Name' => pBE.Product2.Name,
                'UnitPrice' => string.valueOf(pBE.UnitPrice)
            });
       }       

       return JSON.serialize(uniqueProducts.values());
   }

   
}
