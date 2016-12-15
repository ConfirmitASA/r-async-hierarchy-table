/**
 * Created by IvanP on 15.12.2016.
 */
import ReportalBase from "r-reportal-base";

/**
 * A class that provides utility static methods to load children of a level of hiererachy and a table per a given id
 * */
class AsyncHierarchyTable{
  /**
   * Queries if each row might contain child rows by quering hierarchy for next level
   * @param {!String} id - rowheader id for current row
   * @param {!Number} hierarchyID - id of Hierarchy in Table Designer
   * @param {!String} hierarchyControlID - id of the Reportal Hierarchy Component instance on the page
   * @param {!String} pageStateID - Reportal state id
   * @param {Number=} languageCode=9 - Language code (according to Confirmit table of language codes) of the language the hierarchy is going to be streamed in at the page load
   * @returns {Array} array of child nodes of the `id` in hierarchy
   * */
  static fetchChildHierarchy(id,hierarchyID,hierarchyControlID,pageStateID,languageCode=9){
    let path = [
      location.origin,
      'reportal',
      'Hierarchy',
      ReportalBase.getQueryVariable('ReportId'),
      hierarchyID,
      languageCode,
      'GetChildNodes'
    ];

    let query=[
      `nodeId=${id}`,
      `info=${AsyncHierarchyTable.encode({
        IsPreview:ReportalBase.getQueryVariable('Preview')==='true',
        HierarchyControlId:hierarchyControlID
      })}`,
      'isRepBase=false',
      'parameter=',
      `PageStateId=${pageStateID}`
    ];

    let hierarchyItemChildren = ReportalBase.promiseRequest([path.join('/'),'?',query.join('&')].join(''));
    return hierarchyItemChildren.then(response=>{return Promise.resolve(JSON.parse(response))});
  }

  /**
   * Gets row nodes that are child to the parent row#`id`
   * @param {!String} id - rowheader id for current row
   * @param {?String} parentID - rowheader id for parent row
   * @param {!String} tableID - Reportal Aggregated Table Component id
   * @param {!String} pageStateID - Reportal state id
   * @return {Promise} Returns a thenable promise which result is an `HTMLTableElement` with rows that are children to the row#`id`
   * */
  static fetchChildTable(id, parentID, tableID,pageStateID){
    parentID = parentID!=null?parentID:id;
    let path = [
      location.origin,
      'reportal',
      'Report',
      ReportalBase.getQueryVariable('ReportId'),
      'Component',
      tableID
    ];
    let query=[
      `PageId=${ReportalBase.getQueryVariable('PageId')}`,
      `Preview=${ReportalBase.getQueryVariable('Preview')}`,
      `PageStateId=${pageStateID}`,
      `pageFilters=${AsyncHierarchyTable.encode({})}`,
      `customFilters=${AsyncHierarchyTable.encode({})}`,
      `persNodes=${AsyncHierarchyTable.encode([{NodeId:id,Text:null}])}`, // child node id
      `origNodes=${AsyncHierarchyTable.encode([{NodeId:parentID,Text:null}])}` // parent node id
    ];
    let tableResult = ReportalBase.promiseRequest([path.join('/'),'?',query.join('&')].join(''));
    return tableResult.then(response=>{
      let host = document.createElement('span');
      host.innerHTML = response;
      return Promise.resolve(host.querySelector('table'));
    });
  }

  /**
   * Strips rows from the table received
   * @param {HTMLTableElement} table - Aggregated table element
   * @param {Array} excludedRows - rows excluded from insertion
   * @return {Array} Returns an array of rows {HTMLTableRowElement}
   * */
  static stripRowsFromResponseTable(table,excludedRows){
    let rows = [].slice.call(table.querySelectorAll('tbody>tr'));
    if(excludedRows && excludedRows.length>0){
      excludedRows.reverse().forEach(index=>{
        rows.splice(index, 1);
      });
    }
    return rows;
  }

  /**
   * Does `JSON.stringify` and `encodeURIComponent` of anything passed to be added to the query string
   * @param {String|Object|Array} toEncode - piece to be URLencoded
   * @returns {String} Returns an encoded string
   * */
  static encode(toEncode){
    return encodeURIComponent(JSON.stringify(toEncode));
  }

}

export default AsyncHierarchyTable;


window.Reportal = window.Reportal || {};
ReportalBase.mixin(window.Reportal,{
  AsyncHierarchyTable
});
