viewModel.generateBreadcrumb(false, ["Dashboard", "/dashboard/index"], ["Source to Target", "index"]);

// < !--Mapping = Data Flow = Source to Target-- >
var master = {}
viewModel.master = master
master.view = {}
// ====== user

master.activeMenu = ko.observable('ObjectMapping') // User, Group, Menu, Log

master.newMasterData = function () {
    return {
        Id: "",
        SourceAttrId: [],
        SourceAttrLogicalName: [],
        SourceAttrPhysicalName: [],
        SourceObjectId: "",
        SourceObjectLogicalName: [],
        SourceObjectPhysicalName: [],
        TargetAttrId: 0,
        TargetAttrLogicalName: "",
        TargetAttrPhysicalName: "",
        TargetObjectId: "",
        TargetObjectLogicalName: "",
        TargetObjectPhysicalName: "",
        TargetColumnDefaultValue: "",
        MappingGroupId: "",
	    MappingGroupName: "",
	    MappingGroupCode: "",
        IsProd:"false",
        CountrySpecificMapIndicator:"false",
        IsBKeyInd:"",
        IsBMapInd:"",
        MapVersion:"",
        MapChangeNote:"",
        DataProcessingRuleId:"",
        DataProcessingRuleName:"",
        Projects: [],
        ProjectsId: [],
        Remark:"",
        RemarkMaker:"",
        Checker: "",
        CheckedBy: "",
        IsActive: "true",
        Sources : [],
        RefferenceAttrId: "",
        SourceDBId: "",
        TargetDBId: [],
        SourceSystemId: [],
        SourceCountryId: [],
        TargetSystemId: [],
        TargetCountryId: [],
        IsDprAsSource : false,
        NewMappingGroup : false,
        SourceLogicalLayer : "",
        TargetLogicalAppLayerName : "",
        Mappings : [],
        MappingsId : [],
        Status: STATUS_PENDING,

        ModeUpdate: "create", //update / approve / reject / create
        PendingStatus: "create",
    }
}

// Set("Page", 0).Set("PerPage", 10).Set("Type", "Project_CD").Set("SortField", "_id").Set("SortType", "-1")
master.filterData = function() {
    return {
        Page : 0,
        PerPage : 20,
        Type : "",
        SortField : "_id",
        SortType : "-1",
        AdditionalFilter : "",
        BetweenFieldLogic : ""
    }
}

master.isSetDataFinish = ko.observable(true)
master.selected = ko.mapping.fromJS(master.newMasterData())
master.filter = ko.mapping.fromJS(master.filterData())
master.filterObjectDef = ko.mapping.fromJS(master.filterData())
master.isInsertMode = ko.observable(false)
master.dataMasterData = ko.observableArray([])
master.dataIsActive = ko.observableArray(
    [{
        _id: true,
        Title: "Active"
    }
    , {
        _id: false,
        Title: "Not Active"
    }]
)
master.dataYesNo = ko.observableArray(
    [{
        _id: "true",
        Title: "Yes"
    }
    , {
        _id: "false",
        Title: "No"
    }]
)
master.dataChecker = ko.observableArray([]);

master.dataSourceObject = ko.observableArray([])
master.dataTargetObject = ko.observableArray([])

master.dataSourceStructure = ko.observableArray([])
master.dataTargetStructure = ko.observableArray([])

master.dataMappingProject = ko.observableArray([])
master.IsSelectedProduction = ko.observable(false)
master.IsSelectedProductionText = ko.observable("No")

master.loadRole = function () {
    viewModel.isLoading(true)
    viewModel.ajaxPost('/mapping/getrole', {}, function (data) {
        viewModel.isLoading(false)
        if (data.hasOwnProperty("Role")) {
            viewModel.role(data.Role);
        }
        master.view.refreshRoleView();
    })
}

master.InfoDetail = new viewModel.model.InfoDetail();

// refresh view based role manual, because ko not working properly for dynamic with kendoui
master.view.refreshRoleView = function () {
    var r = viewModel.role()
    var propAdmin = r === "Admin";
    var propMaker = r === "Admin" || r === "Maker";
    var propChecker = r === "Admin" || r === "Checker";
    var propViewer = r === "Viewer";
    switch (r) {
        case "Admin": {
            break;
        }
        case "Maker": {
            break;
        }
        case "Checker": {
            break;
        }
        case "Viewer":
        default: {
            break;
        }
    }
    // obj. def
    $('#sourceObject').prop('disabled', !propMaker);
    $('#targetObject').prop('disabled', !propMaker);
    $('#sourceStructure').prop('disabled', !propMaker);
    $('#targetStructure').prop('disabled', !propMaker);
    $('#IsActive').data("kendoDropDownList").enable(propMaker);
    $('#IsProd').data("kendoDropDownList").enable(propMaker);
    $('#CountrySpecificMapIndicator').data("kendoDropDownList").enable(propMaker);
    $('#IsBKeyInd').data("kendoDropDownList").enable(propMaker);
    $('#IsBMapInd').data("kendoDropDownList").enable(propMaker);
    // $('#MapVersion').prop('disabled', !propMaker);
    // $('#MapChangeNote').prop('disabled', !propMaker);
    
    $('#Checker').prop('disabled', !propMaker);
    $('#Remark').prop('disabled', !propChecker);

    master.view.refreshRoleGridView(r);
}

// separated role view
master.view.refreshRoleGridView = function (r) {
    if (typeof r === 'undefined') {
        r = viewModel.role();
    }
    // grid
    if (r === "Admin" || r === "Viewer") {
        var grid = $(".grid-master-data").data("kendoGrid");
        grid.hideColumn("Id");
    } else {
        var grid = $(".grid-master-data").data("kendoGrid");
        grid.showColumn("Id");
    }
}

master.initMasterData = function () {
    master.dataMasterData([])
    var columns = master.getGridColumnMaster(master.ShowDetail());
    var payload = ko.mapping.toJS(master.filter);
    var config = {
        dataSource: {
            transport: {
                read: function(opt) {
                    payload.Page = opt.data.page -1;
                    payload.PerPage = opt.data.take;
                    payload.SortField = "";
                    payload.SortType = "";
                    payload.SortFields = {}
                    if(opt.data.sort && opt.data.sort.length > 0) {
                        SortField = opt.data.sort[0].field.slice(opt.data.sort[0].field.indexOf(".") + 1)
                        SortType = opt.data.sort[0].dir
                        payload.SortFields[SortField] = SortType
                        // payload.SortField = opt.data.sort[0].field.slice(opt.data.sort[0].field.indexOf(".") + 1);
                        // payload.SortType = opt.data.sort[0].dir;
                        // if (SortField.toLowerCase() == "status") {
                        //     if (SortType == "desc") {
                        //         SortType = "asc"
                        //     }
                        //     else if (SortType == "asc") {
                        //         SortType = "desc"
                        //     }
                        //     payload.SortFields[SortField] = SortType
                        //     payload.SortFields["checkedby"] = opt.data.sort[0].dir
                        // }
                    }
                    else {
                        // Set Default Sort
                        payload.SortField = "updt_dt";
                        payload.SortType = "desc";
                    }
                    payload.AdditionalFilter = {};
                    if(opt.data.filter) {
                        _.each(opt.data.filter.filters, function(f) {
                            var field = f.field;
                            payload.AdditionalFilter[field.substr(field.indexOf(".") + 1)] = [{
                                Type: f.operator,
                                Value: f.value
                            }]
                        })
                    }
                    _.each(ko.mapping.toJS(master.filterDropdown), function (k , v) {
                        if (k != "" && v != "objphyname" && v != "attrphyname") {
                            payload.AdditionalFilter[v] = [{
                                Type: "eq",
                                Value: k
                            }]
                        }
                    })
                    filterDrop = ko.mapping.toJS(master.filterDropdown)
                    payload["ObjectPhysicalName"] = filterDrop.objphyname
                    payload["AttributePhysicalName"] = filterDrop.attrphyname
                    payload["MappingVersion"] = filterDrop.mapversion
                    payload["Production"] = filterDrop.isprod
                    payload["ObjectSystemName"] = filterDrop.sysname

                    if (payload["Production"] != "") {
                        payload["Production"] = (payload["Production"] == "Yes") + ""
                    }

                    viewModel.ajaxPost('/mapping/get2', payload, function(res) {
                        master.dataMasterData(res.Data)
                        opt.success({data: res.Data, total: res.Total});
                    })
                }
            },
            schema: {
                data: "data",
                total: "total",
            },
            pageSize: 10,
            serverPaging: true,
            serverSorting: true,
            // serverFiltering: true,
        },
        pageable: {
            numeric: true,
            previousNext: true,
            pageSizes: [10, 20, 50, 100],
            // messages: {
            //     display: "Showing {2} data items",
            // }
        },
        sortable: true,
        // filterable: {
        //     extra: false,
        //     operators: {
        //         string: {
        //             contains: "Contains",
        //             startswith: "Starts With",
        //             notcontains: "Does Not Contain",
        //             endswith: "Ends With",
        //             isempty: "Empty"
        //         }
        //     }
        // },
        columns:  columns,
        dataBound: function () {
            viewModel.prepareTooltipsterGrid(this)

            //on dataBound event restore previous selected rows:
            var view = this.dataSource.view();
            var checked = (view.length > 0) // Set Default is check or not
            $.each(view , function(r , o) {
                ar_ind = master.gridChecked().indexOf(""+o.Id)
                if (ar_ind == -1) {
                    checked = false
                }
            })
            $("#cb_grid_checked").prop("checked" , checked)

            var items = this._data;
            var tableRows = $(this.table).find("tr");
            tableRows.each(function (index) {
                var row = $(this);
                var item = items[index];
                if (item.Status == STATUS_PENDING) {
                    row.addClass("bg-highlight-gray");
                } else {
                    row.removeClass("bg-highlight-gray");
                }
            });
        }
    }
    // $('.grid-master-data').replaceWith('<div class="grid-master-data"></div>')
    $('.grid-master-data').kendoGrid(config)
    $(".grid-master-data").data("kendoGrid").thead.kendoTooltip({
        filter: ".k-link",
        content: function (e) {
            // var tooltipSpan = $(target).find(".k-link :first");
            var tooltipSpan = $(e.target).find(":first");
            var tooltip = tooltipSpan.attr("title");            
            return tooltip;
        },
        position : "top"
    }); 
    // master.refreshMasterData();            
}

master.refreshInfo = function () {
    master.InfoDetail.isRefresh(true);
    viewModel.ajaxPost("/mapping/getinfo", {}, function (res) {
        master.InfoDetail.isRefresh(false);
        if (!res.IsError) {
            master.InfoDetail.data(res.Data)
        } else {
            console.error("Error", res.Message);
        }
    }, function (err) {
        master.InfoDetail.isRefresh(false);
    })
}

master.refreshMasterData = function() {
    var grid = $(".grid-master-data").data("kendoGrid");
    var options = grid.getOptions();
    var columns = master.getGridColumnMaster(master.ShowDetail());
    options.columns = columns;
    grid.setOptions(options); // auto refresh data too
    grid.thead.kendoTooltip({
        filter: ".k-link",
        content: function (e) {
            // var tooltipSpan = $(target).find(".k-link :first");
            var tooltipSpan = $(e.target).find(":first");
            var tooltip = tooltipSpan.attr("title");
            
            return tooltip;
        },
        position : "top"
    }); 
    master.view.refreshRoleGridView();
    master.refreshInfo()
}

master.gridChecked = ko.observableArray([])

master.getGridColumnMaster = function (showAll){
    var column = [
        {
            title: '<input class=\'k-checkbox\' type=\'checkbox\' id=\'cb_grid_checked\'><label class=\'k-checkbox-label k-no-text\' for=\'cb_grid_checked\'>&#8203;</label>',
            width: 35,
            headerAttributes : {
                class: 'align-center' ,
                // style: "text-align: center;"
            },
            attributes: {
                class: 'align-center' 
            },
            template: function (d) {
                ar_ind = master.gridChecked().indexOf("" + d.Id)
                
                return "<input type='checkbox' id='"+d.Id+"' class='grid_checked k-checkbox' "+(ar_ind != -1 ? "checked" : "")+">"
                    + '<label class="k-checkbox-label k-no-text" for="'+d.Id+'">&#8203;</label>'
                    // + "<button class='btn btn-xs btn-danger' data-tooltipster='Remove'><i class='fa fa-trash' onclick='master.destroy(\"" + d.Id + "\")'></i></button>"
            }, 
            encoded: true
        },
        {
            headerTemplate: '<span title="">Edit</span>',
            title: 'Edit',
            width: 40,
            attributes: { class: 'align-center' },
            template: function (d) {
                return "<button class='btn btn-xs btn-primary' data-tooltipster='Edit' onclick='master.edit(\"" + d.Id + "\")'><i class='fa fa-edit'></i></button>"
            }
        },
    ];
    if (showAll) { // Show More
        column.push(
            {
                field: 'Id',
                width: "125px", 
                title: 'Mapping ID', 
                headerTemplate: '<span title="Map_ID">Mapping ID</span>'
            },
            {
                field: 'Status',
                width: "75px",
                headerTemplate: '<span title="STATUS">Status</span>',
                template: function (d) {
                    return viewModel.GetModelStatusApproval(d);
                }
            },
            { // Logical App
                // field: 'Sources[0].SourceLogicalAppLayerName', 
                field: 'TargetLogicalAppLayerName', 
                width: "200px", 
                headerTemplate: '<span title="SRC_LOG_LYR">Source Logical Layer</span>' ,
                template : function(e) {
                    if (e.Sources.length > 0) {
                        return e.Sources[0].SourceLogicalAppLayerName
                    }

                    return ""
                }
            },
            { // Logical App
                field: 'TargetLogicalAppLayerName', 
                width: "200px", 
                headerTemplate: '<span title="TGT_LOG_LYR">Target Logical Layer</span>'
            },
            { // System
                field: 'TargetSystemName', 
                width: "200px", 
                headerTemplate: '<span title="SRC_SYS_ID">Source System Name</span>' ,
                template : function(e) {
                    if (e.Sources.length > 0) {
                        return e.Sources[0].SourceSystemName
                    }

                    return ""
                }
            },
            { // System
                field: 'TargetSystemName', 
                width: "200px", 
                headerTemplate: '<span title="TGT_SYS_ID">Target System Name</span>'
            },
            { // Country
                field: 'TargetCountryName', 
                width: "200px", 
                headerTemplate: '<span title="SRC_CTR_NAME">Source Country Name</span>' ,
                template : function(e) {
                    if (e.Sources.length > 0) {
                        return e.Sources[0].SourceCountryName
                    }

                    return ""
                }
            },
            { // Country
                field: 'TargetCountryName', 
                width: "200px", 
                headerTemplate: '<span title="TGT_CTR_NAME">Target Country Name</span>'
            },
            { // Database
                field: 'TargetDBName', 
                width: "200px", 
                headerTemplate: '<span title="SRC_DB_NAME">Source Database Name</span>' ,
                template : function(e) {
                    if (e.Sources.length > 0) {
                        return e.Sources[0].SourceDBName
                    }

                    return ""
                }
            },
            { // Database
                field: 'TargetDBName', 
                width: "200px", 
                headerTemplate: '<span title="TGT_DB_NAME">Target Database Name</span>'
            },
            {
                field: 'TargetObjectPhysicalName',
                width: "200px",
                title: 'Source Object Physical Name', 
                headerTemplate: '<span title="SRC_OBJT_ID">Source Object Physical Name</span>' ,
                template : function(e) {
                    if (e.Sources.length > 0) {
                        return e.Sources[0].SourceObjectPhysicalName
                    }

                    return ""
                }
            },
            {
                field: 'TargetAttrPhysicalName',
                width: "200px",
                title: 'Source Attribute Physical Name', 
                headerTemplate: '<span title="SRC_ATTR_ID">Source Attribute Physical Name</span>',
                template : function(e) {
                    if (e.Sources.length > 0) {
                        return e.Sources[0].SourceAttrPhysicalName
                    }

                    return ""
                }
            },
            {
                field: 'TargetObjectPhysicalName',
                width: "200px", 
                title: 'Target Object Physical Name', 
                headerTemplate: '<span title="TGT_OBJT_ID">Target Object Physical Name</span>'
            },
            {
                field: 'TargetAttrPhysicalName',
                width: "200px",
                title: 'Target Attribute Physical Name', 
                headerTemplate: '<span title="TGT_ATTR_ID">Target Attribute Physical Name</span>'
            },
            {
                field: 'MapVersion',
                width: "200px", 
                title: 'Mapping Version',
                headerTemplate: '<span title="MAP_VERS">Mapping Version</span>'
            },
            {
                // field: 'MapChangeNote',
                field: 'MapNote',
                width: "200px", 
                title: 'Mapping Note',
                headerTemplate: '<span title="MAP_NOTE">Map Note</span>'
            },
            // {
            //     field: 'TargetColumnDefaultValue',
            //     title: 'Target Column Default Value', width: "200px"
            //     , headerTemplate: '<span title="">Target Column Default Value</span>'
            // },
            {
                field: 'DataProcessingRuleId',
                width: "200px",
                title: 'Data Processing Rule', 
                headerTemplate: '<span title="DATA_PROC_RULE_ID">Data Processing Rule</span>'
            },
            {
                field: 'MappingGroupName',
                width: "200px",
                title: 'Map Group', 
                headerTemplate: '<span title="">Map Group</span>'
            },
            {
                field: 'RefferenceAttrId',
                width: "200px",
                title: 'Reference Attribute ID ', 
                headerTemplate: '<span title="REF_ATTR_ID">Reference Attribute ID </span>'
            },
            {
                field: 'CountrySpecificMapIndicator',
                width: "250px",
                title: 'Country Special Mapping Indicator', 
                headerTemplate: '<span title="CTRY_SPEC_MAP_IND">Country Special Mapping Indicator </span>'
            },
            {
                field: 'IsBKeyInd',
                width: "200px",
                title: 'Is BKEY Indicator', 
                headerTemplate: '<span title="IS_BKEY_IND">Is BKEY Indicator</span>',
                template: "#= viewModel.getBoolString(IsBKeyInd) #"
            },
            {
                field: 'IsBMapInd',
                width: "200px",
                title: 'Is BMAP Indicator', 
                headerTemplate: '<span title="IS_BMAP_IND">Is BMAP Indicator</span>',
                template: "#= viewModel.getBoolString(IsBMapInd) #"
            },
            {
                field: 'IsProd',
                width: "200px",
                title: 'Production',  
                headerTemplate: '<span title="IS_PROD">Production</span>',
                template: "#= viewModel.getBoolString(IsProd == 'true') #"
            },
            {
                field: 'Remark',
                width: "200px",
                title: 'Remark', 
                headerTemplate: '<span title="RMK">Remark</span>'
            },
            {
                field: 'IsActive',
                width: "200px",
                title: 'Is Active', 
                headerTemplate: '<span title="IS_ACT_IND">Is Active</span>',
                template: "#= viewModel.getBoolString(IsActive) #"
            },
            {
                field: 'UPDT_BY',
                width: "200px",
                title: 'Created/Updated By', 
                headerTemplate: '<span title="UPDT_BY">Created/Updated By</span>',
            },
            {
                field: 'UPDT_DT',
                width: "200px",
                title: 'Created/Updated Date', 
                headerTemplate: '<span title="UPDT_DT">Created/Updated Date</span>',
                template: "#= viewModel.parseDate(UPDT_DT) #"
            },
        )
    } else {
        column.push(
            {
                field: 'Status',
                width: "75px",
                headerTemplate: '<span title="STATUS">Status</span>',
                template: function (d) {
                    return viewModel.GetModelStatusApproval(d);
                }
            },
            { // Logical App
                // field: 'Sources[0].SourceLogicalAppLayerName', 
                field: 'TargetLogicalAppLayerName', 
                width: "200px", 
                headerTemplate: '<span title="SRC_LOG_LYR">Source Logical Layer</span>' ,
                template : function(e) {
                    if (e.Sources.length > 0) {
                        return e.Sources[0].SourceLogicalAppLayerName
                    }

                    return ""
                }
            },
            { // Logical App
                field: 'TargetLogicalAppLayerName', 
                width: "200px", 
                headerTemplate: '<span title="TGT_LOG_LYR">Target Logical Layer</span>'
            },
            { // System
                field: 'TargetSystemName', 
                width: "200px", 
                headerTemplate: '<span title="SRC_SYS_ID">Source System Name</span>' ,
                template : function(e) {
                    if (e.Sources.length > 0) {
                        return e.Sources[0].SourceSystemName
                    }

                    return ""
                }
            },
            { // System
                field: 'TargetSystemName', 
                width: "200px", 
                headerTemplate: '<span title="TGT_SYS_ID">Target System Name</span>'
            },
            { // Country
                field: 'TargetCountryName', 
                width: "200px", 
                headerTemplate: '<span title="SRC_CTR_NAME">Source Country Name</span>' ,
                template : function(e) {
                    if (e.Sources.length > 0) {
                        return e.Sources[0].SourceCountryName
                    }

                    return ""
                }
            },
            { // Country
                field: 'TargetCountryName', 
                width: "200px", 
                headerTemplate: '<span title="TGT_CTR_NAME">Target Country Name</span>'
            },
            { // Database
                field: 'TargetDBName', 
                width: "200px", 
                headerTemplate: '<span title="SRC_DB_NAME">Source Database Name</span>' ,
                template : function(e) {
                    if (e.Sources.length > 0) {
                        return e.Sources[0].SourceDBName
                    }

                    return ""
                }
            },
            { // Database
                field: 'TargetDBName', 
                width: "200px", 
                headerTemplate: '<span title="TGT_DB_NAME">Target Database Name</span>'
            },
            {
                field: 'TargetObjectPhysicalName',
                width: "200px",
                title: 'Source Object Physical Name', 
                headerTemplate: '<span title="SRC_OBJT_ID">Source Object Physical Name</span>' ,
                template : function(e) {
                    if (e.Sources.length > 0) {
                        return e.Sources[0].SourceObjectPhysicalName
                    }

                    return ""
                }
            },
            {
                field: 'TargetAttrPhysicalName',
                width: "200px",
                title: 'Source Attribute Physical Name', 
                headerTemplate: '<span title="SRC_ATTR_ID">Source Attribute Physical Name</span>',
                template : function(e) {
                    if (e.Sources.length > 0) {
                        return e.Sources[0].SourceAttrPhysicalName
                    }

                    return ""
                }
            },
            {
                field: 'TargetObjectPhysicalName',
                width: "200px",
                title: 'Target Object Physical Name', 
                headerTemplate: '<span title="TGT_OBJT_ID">Target Object Physical Name</span>'
            },
            {
                field: 'TargetAttrPhysicalName',
                width: "200px",
                title: 'Target Attribute Physical Name', 
                headerTemplate: '<span title="TGT_ATTR_ID">Target Attribute Physical Name</span>'
            },
            {
                field: 'MapVersion',
                width: "200px",
                title: 'Mapping Version', 
                headerTemplate: '<span title="MAP_VERS">Mapping Version</span>'
            },
            {
                // field: 'MapChangeNote',
                field: 'MapNote',
                width: "200px", 
                title: 'Mapping Note', 
                headerTemplate: '<span title="MAP_NOTE">Map Note</span>'
            },
        )
    }

    column.push({
        title: '&nbsp;',
        width: 110,
        attributes: { class: 'align-center' },
        template: function (d) {
            _statusIdentifier = viewModel.GetModelStatusApproval(d, false)

            renderBtn = "";
            btnDelNotif = "<button class='btn btn-xs btn-danger' data-tooltipster='Pending Delete' disabled><i class='fa fa-trash'></i></button>"
            btnDel = "<button class='btn btn-xs btn-danger' data-tooltipster='Delete' onclick='master.deleteMaster(\"" + d.Id + "\"," + d.Status + ")'><i class='fa fa-trash'></i></button>"
            btnMapToProject = "<button class='btn btn-xs btn-success' data-tooltipster='Map to Projects' onclick='master.detail(\"" + d.Id + "\")'><i class='fa fa-unlink'></i></button> &nbsp; ";

            // delete only for admin & maker from approval / rejected entity
            // delete/approve only for admin & checker from pending delete
            if ((viewModel.role().toLowerCase() == "maker" || viewModel.role().toLowerCase() == "admin") && (_statusIdentifier == MODEL_STATUS_APPROVED || _statusIdentifier == MODEL_STATUS_REJECTED)) {
                renderBtn += btnDel
            } else if ((viewModel.role().toLowerCase() == "checker" || viewModel.role().toLowerCase() == "admin") && (_statusIdentifier == MODEL_STATUS_PENDING_DELETE)) {
                renderBtn += btnDelNotif
            }
            renderBtn += " " + btnMapToProject
            return renderBtn
        }
    })
    
    return column;
}

master.storeMasterData = function(type) {
    type = (type == undefined ? "cl" : type)
    ins = ($("#modal-insert").data('bs.modal') || {}).isShown
    if (ins) {
        if (!viewModel.isFormValid('#modal-insert form')) {
            swal("Error!", "Some inputs are not valid", "error")
            return
        }
    }

    det = ($("#modal-detail").data('bs.modal') || {}).isShown
    if (det) {
        if (!viewModel.isFormValid('#modal-detail form')) {
            swal("Error!", "Some inputs are not valid", "error")
            return
        }
    }     

    // cek jika object tidak active
    // Source
    if (!master.selected.IsDprAsSource()) {
        src = $("#sourceObject").data("kendoDropDownList")
        if (src.dataItem() != undefined) {
            if (!src.dataItem().IsActive && src.dataItem().Status != STATUS_APPROVED) {
                swal("Error!", "Unable to save Mapping due to corresponding Source Object name is in Pending status and inactive", "error")
                return
            }
            else if (!src.dataItem().IsActive) {
                swal("Error!", "Unable to save Mapping due to corresponding Source Object name is in inactive state", "error")
                return
            }
            else if (src.dataItem().Status != STATUS_APPROVED) {
                msg = "Pending status"
                if (src.dataItem().Status == STATUS_REJECTED) {
                    msg = "Reject status"
                }

                swal("Error!", "Unable to save Mapping due to corresponding Source Object name is in " + msg, "error")
                return
            }
        }

        src = $("#sourceStructure").data("kendoDropDownList")
        if (src.dataItem() != undefined) {
            if (!src.dataItem().IsActive && src.dataItem().Status != STATUS_APPROVED) {
                swal("Error!", "Unable to save Mapping due to corresponding Source Attribute name is in Pending status and inactive", "error")
                return
            }
            else if (!src.dataItem().IsActive) {
                swal("Error!", "Unable to save Mapping due to corresponding Source Attribute name is in inactive state", "error")
                return
            }
            else if (src.dataItem().Status != STATUS_APPROVED) {
                msg = "Pending status"
                if (src.dataItem().Status == STATUS_REJECTED) {
                    msg = "Reject status"
                }

                swal("Error!", "Unable to save Mapping due to corresponding Source Attribute name is in " + msg, "error")
                return
            }
        }
    }
    
    tgt = $("#targetObject").data("kendoDropDownList")
    if (tgt.dataItem() != undefined) {
        if (!tgt.dataItem().IsActive && tgt.dataItem().Status != STATUS_APPROVED) {
            swal("Error!", "Unable to save Mapping due to corresponding Target Object name is in Pending status or inactive", "error")
            return
        }
        else if (!tgt.dataItem().IsActive) {
            swal("Error!", "Unable to save Mapping due to corresponding Target Object name is in inactive state", "error")
            return
        }
        else if (tgt.dataItem().Status != STATUS_APPROVED) {
            msg = "Pending status"
            if (tgt.dataItem().Status == STATUS_REJECTED) {
                msg = "Reject status"
            }

            swal("Error!", "Unable to save Mapping due to corresponding Target Object name is in " + msg, "error")
            return
        }
    }
    
    tgt = $("#targetStructure").data("kendoDropDownList")
    if (tgt.dataItem() != undefined) {
        if (!tgt.dataItem().IsActive && tgt.dataItem().Status != STATUS_APPROVED) {
            swal("Error!", "Unable to save Mapping due to corresponding Target Attribute name is in Pending status or inactive", "error")
            return
        }
        else if (!tgt.dataItem().IsActive) {
            swal("Error!", "Unable to save Mapping due to corresponding Target Attribute name is in inactive state", "error")
            return
        }
        else if (tgt.dataItem().Status != STATUS_APPROVED) {
            msg = "Pending status"
            if (tgt.dataItem().Status == STATUS_REJECTED) {
                msg = "Reject status"
            }

            swal("Error!", "Unable to save Mapping due to corresponding Target Attribute name is in " + msg, "error")
            return
        }
    }

    tgt = $("#dpr_drop").data("kendoDropDownList")
    if (tgt.dataItem() != undefined) {
        if (!tgt.dataItem().IsActive && tgt.dataItem().Status != STATUS_APPROVED) {
            swal("Error!", "Unable to save Mapping due to corresponding Data Processing Rule is in Pending status or inactive", "error")
            return
        }
        else if (!tgt.dataItem().IsActive) {
            swal("Error!", "Unable to save Mapping due to corresponding Data Processing Rule is in inactive state", "error")
            return
        }
        else if (tgt.dataItem().Status != STATUS_APPROVED) {
            msg = "Pending status"
            if (tgt.dataItem().Status == STATUS_REJECTED) {
                msg = "Reject status"
            }

            swal("Error!", "Unable to save Mapping due to corresponding Data Processing Rule is in " + msg, "error")
            return
        }
    }
    // return
    
    master.selected.IsActive(master.selected.IsActive() == "true")
    master.selected.DataProcessingRuleId(master.selected.DataProcessingRuleId())

    // var _dataMapGroup = master.dataMapGroup().find(function (d) { return d.Id == master.selected.MappingGroupId() })
    // if (typeof _dataMapGroup !== 'undefined') {
    //     master.selected.MappingGroupCode(_dataMapGroup.Value);
    //     master.selected.MappingGroupName(_dataMapGroup.Name);
    // }

    //
    if (!master.selected.IsDprAsSource() && master.selected.ModeUpdate() != "detail") {
        objItem = $("#sourceObject").data("kendoDropDownList").dataItem()
        atrItem = $("#sourceStructure").data("kendoDropDownList").dataItem()
        // Set Sources
        master.selected.Sources([
            {
                SourceObjectId : objItem.Id,
                SourceObjectPhysicalName : objItem.PhysicalName,
                SourceObjectLogicalName : objItem.LogicalName,
                
                SourceAttrId : atrItem.Id,
                SourceAttrPhysicalName : atrItem.PhysicalName,
                SourceAttrLogicalName : atrItem.LogicalName,
            }
        ])
    }

    ar_src_attr = []
    $.each(master.selected.Sources() , function(row , o) {
        ar_src_attr.push(o.SourceAttrId)
    })
    master.selected.SourceAttrId(ar_src_attr)

    var payload = ko.mapping.toJS(master.selected)

    // When Pending update or delete prevent update
    if (payload.Status == STATUS_PENDING && payload.ModeUpdate == MODE_UPDATE) {
        swal("Failed!" , "Data on pending "+payload.PendingStatus+" state" , "error")
        return
    }

    payload.Projects = master.projectsList;

    if (payload.Sources.length == 0) { // Autocomplete not selected
        swal("Error!", "Attribute ID not Defined", "error")
        return
    }

    if (payload.TargetAttrId == 0) { // Autocomplete not selected
        swal("Error!", "Target Attribute ID not Defined", "error")
        return
    }

    viewModel.ajaxPost('/mapping/create', payload, function (data) {
        if (!data.IsError) {
            swal({
                title: 'Success',
                text: 'Changes saved',
                type: 'success',
                timer: 2000,
                showConfirmButton: false
            })
        
            if (type == "cl") {
                $('#modal-insert').modal('hide')
            } else {
                if (type == "nw") {
                    master.create(false);
                } else if (type == "cp") {
                    master.selected.Id("")
                }
            }
        
            $('#modal-detail').modal('hide')
            master.refreshMasterData()
        }
        else {
            swal("Error!", data.Message, "error")
        }
        
    })
}

var ar_struct = [];
var ar_struct_id = [];

var ar_struct_selected = []
var ar_struct_selected_id = []
var ar_mapping = []

master.edit = function(Id) {
    master.isSetDataFinish(false)
    ar_struct = [];
    ar_struct_id = [];

    ar_struct_selected = []
    ar_struct_selected_id = []

    master.dataTargetStructure([])
    var data = master.dataMasterData().find(function (d) { return d.Id == Id })

    master.IsDprSubs(data.IsDprAsSource)

    data.ModeUpdate = "update"
    // SourceObjectId
    var payload = {
        AdditionalFilter : {},
    };
    
    // check isdpr or not
    data.SourceLogicalLayer = "Tier 1"
    data.TargetLogicalLayer = "Tier 2"
    if (!data.IsDprAsSource) {
        if (data.Sources.length > 0) {
            data.SourceSystemId = data.Sources[0].SourceSystemId
            data.SourceCountryId = data.Sources[0].SourceCountryId
            data.SourceDBId = data.Sources[0].SourceAppLayerId
            data.SourceObjectId = data.Sources[0].SourceObjectId
            data.SourceAttrId = data.Sources[0].SourceAttrId
            data.SourceLogicalLayer = data.Sources[0].SourceLogicalAppLayerName
        } else {
            data.SourceSystemId = ""
            data.SourceCountryId = ""
            data.SourceDBId = ""
            data.SourceObjectId = ""
            data.SourceAttrId = ""
            data.SourceLogicalLayer = ""
        }
    }
    
    data.TargetDBId = data.TargetAppLayerId

    ar_mapping = []
    ar_mappingList = []
    $.each(data.Mappings , function(row , o){
        ar_mapping.push(o.MappingGroupId)
        ar_mappingList.push({
            Id : o.MappingGroupId,
            Name : o.MappingGroupName,
            Value : o.MappingGroupCode,
        })
    })
    master.dsMappingGroup.data(ar_mappingList)

    master.isInsertMode(false)

    // Read 

    // set dumy data START
    master.selected.MappingsId(ar_mapping)
    if (data.Sources.length > 0) {
        $("#sourceObjectDBName").data("kendoDropDownList").dataSource.data([
            {
                Id : data.Sources[0].SourceAppLayerId,
                DBName : data.Sources[0].SourceDBName
            }
        ])
        $("#sourceObjectSystemName").data("kendoDropDownList").dataSource.data([
            {
                SourceSystemId : data.Sources[0].SourceSystemId,
                SourceSystemName : data.Sources[0].SourceSystemName
            }
        ])
        $("#sourceObjectCountryName").data("kendoDropDownList").dataSource.data([
            {
                id : data.Sources[0].SourceCountryId,
                name : data.Sources[0].SourceCountryName
            }
        ])
        $("#sourceObject").data("kendoDropDownList").dataSource.data([
            {
                Id : data.Sources[0].SourceObjectId,
                PhysicalName : data.Sources[0].SourceObjectPhysicalName
            }
        ])
        $("#sourceStructure").data("kendoDropDownList").dataSource.data([
            {
                Id : data.Sources[0].SourceAttrId,
                PhysicalName : data.Sources[0].SourceAttrPhysicalName
            }
        ])
    } else { // Dont have any source
        $("#sourceObjectDBName").data("kendoDropDownList").dataSource.data([
            {
                Id : "",
                DBName : ""
            }
        ])
        $("#sourceObjectSystemName").data("kendoDropDownList").dataSource.data([
            {
                SourceSystemId : "",
                SourceSystemName : ""
            }
        ])
        $("#sourceObjectCountryName").data("kendoDropDownList").dataSource.data([
            {
                id : "",
                name : ""
            }
        ])
        $("#sourceObject").data("kendoDropDownList").dataSource.data([
            {
                Id : "",
                PhysicalName : ""
            }
        ])
        $("#sourceStructure").data("kendoDropDownList").dataSource.data([
            {
                Id : "",
                PhysicalName : ""
            }
        ])
    }
    
    // Target
    $("#targetObjectDBName").data("kendoDropDownList").dataSource.data([
        {
            Id : data.TargetAppLayerId,
            DBName : data.TargetDBName
        }
    ])
    $("#targetObjectSystemName").data("kendoDropDownList").dataSource.data([
        {
            SourceSystemId : data.TargetSystemId,
            SourceSystemName : data.TargetSystemName
        }
    ])
    $("#targetObjectCountryName").data("kendoDropDownList").dataSource.data([
        {
            id : data.TargetCountryId,
            name : data.TargetCountryName
        }
    ])
    $("#targetObject").data("kendoDropDownList").dataSource.data([
        {
            Id : data.TargetObjectId,
            PhysicalName : data.TargetObjectPhysicalName
        }
    ])
    $("#targetStructure").data("kendoDropDownList").dataSource.data([
        {
            Id : data.TargetAttrId,
            PhysicalName : data.TargetAttrPhysicalName
        }
    ])
    // set dumy data END
    ko.mapping.fromJS(data, master.selected)

    // Load Add Data Source
    $("#dpr_drop").data("kendoDropDownList").dataSource.read()
    $("#FRM_MapGroup").data("kendoDropDownList").dataSource.read()
    $("#sourceObjectDBName").data("kendoDropDownList").dataSource.read()
    $("#sourceObjectSystemName").data("kendoDropDownList").dataSource.read()
    $("#sourceObjectCountryName").data("kendoDropDownList").dataSource.read()
    $("#sourceObject").data("kendoDropDownList").dataSource.read()
    $("#targetObjectDBName").data("kendoDropDownList").dataSource.read()
    $("#targetObjectSystemName").data("kendoDropDownList").dataSource.read()
    $("#targetObjectCountryName").data("kendoDropDownList").dataSource.read()
    $("#targetObject").data("kendoDropDownList").dataSource.read()

    master.view.refreshRoleView();

    $('#modal-insert').modal({
        show: true,
        backdrop: 'static',
        keyboard: false, // prevent esc
    })
    // Get target Structu

    // Reset the css from drag position
    $("#modal-insert > .modal-dialog").css("left", "0").css("top", "0");
}

master.destroy = function(Id) {
    swal({
        title: "Are you sure?",
        text: "You will not be able to recover deleted data!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        closeOnConfirm: false
    }, function(){
        var payload = master.dataMasterData().find(function (d) { return d.Id == Id })

        viewModel.ajaxPostCallback('/access/destroymasterdata', payload, function (data) {
            swal({
                title: 'Success',
                text: 'Master successfully deleted',
                type: 'success',
                timer: 2000,
                showConfirmButton: false
            })
        
            $('#modal-insert').modal('hide')
            master.refreshMasterData()
        })
    });
}

master.create = function (isShown) {
    isShown = (isShown == undefined ? false : isShown)
    master.isInsertMode(true)

    ko.mapping.fromJS(master.newMasterData(), master.selected)

    master.view.refreshRoleView();
    if (isShown) {
        $('#modal-insert').modal({
            show: true,
            backdrop: 'static',
            keyboard: false, // prevent esc
        })
        // Reset the css from drag position
        $("#modal-insert > .modal-dialog").css("left", "0").css("top", "0");
    }

    ar_struct = [];
    ar_struct_id = [];
    ar_struct_selected = [];
    ar_struct_selected_id = [];

    master.dataSourceStructure([])
    master.dataSourceStructure(ar_struct)
    
    master.initAutocompleteSourceStructure("sourceStructure" ,  master.dataSourceStructure() , "s")
    
    // Inject Requeired to MapChangeNote
    // if ($("#MapChangeNote").attr("required")) {
    //     $("#MapChangeNote").removeAttr("required")
    // }

    setTimeout(function () { viewModel.isFormValid('#modal-insert form') }, 310)
}

master.initAutocomplete = function(sourceTier , isedit) {
    var autocomplete = $("#sourceObject").data("kendoDropDownList");

    if (autocomplete != undefined) {
        if (!isedit) {
            autocomplete.value("")
        }
        
        // autocomplete.destroy()
    }

    master.dataSourceStructure([])

    // $("#sourceObject").kendoMultiSelect({
        
    //     // value : master.selected.SourceObjectId
    // })

    // kendo.bind($("#sourceObject") , master.selected)
}

master.refreshComboboxData = function(){
    // var isactive = [
    //     {
    //         _id: true,
    //         Title: "Active"
    //     }
    //     , {
    //         _id: false,
    //         Title: "Not Active"
    //     }
    // ]

    // master.dataIsActive(isactive)

    viewModel.ajaxPost("/mapping/getchecker", {}, function (data) {
        master.dataChecker(data);
    })

    var payload = {
        "Type": "",
        "Page": 0,
        "PerPage": null,
        "SortField": "",
        "SortType": "",
        "AdditionalFilter": [],
    };
    
}

master.initAutocompleteTarget = function(sourceTier , isedit) {
    // var autocomplete = $("#targetObject").data("kendoAutoComplete");

    // if (autocomplete != undefined) {
    //     if (!isedit) {
    //         autocomplete.value("")
    //     }
        
    //     autocomplete.destroy()
    // }
    
    // $("#targetObject").kendoDropDownList()
}

master.initAutocompleteStructure = function(nm , data , type , isedit) {
    var autocomplete = $("#" + nm).data("kendoDropDownList");
    
    if (autocomplete != undefined) {
        if (!isedit) {
            autocomplete.value("")
            // master.selected.TargetAttrId(0)
            // master.selected.TargetAttrLogicalName("")
        }
        autocomplete.setDataSource(data);
    }
    
}

master.initAutocompleteSourceStructure = function(nm , data , type , isedit) {
    var autocomplete = $("#" + nm).data("kendoDropDownList");

    if (autocomplete != undefined) {
        if (!isedit) {
            autocomplete.value("")
        }
        autocomplete.setDataSource(data);
        // autocomplete.dataSource.read();
    }
}

master.approveMaster = function (IsApproveAction = true) {
    // cannot approve/reject approved & rejected object
    if (master.selected.Status() != STATUS_PENDING) {
        return;
    }

    Ids = [master.selected.Id()]
    if (IsApproveAction) {
        swal({
            title: 'Are you sure want to approve ' + viewModel.getActionStringFromPending(master.selected.PendingStatus()) + ' ?',
            text: "You won't be able to revert this.",
            type: 'warning',
            showCancelButton: true,
            // confirmButtonClass: "btn-danger",
            // confirmButtonText: "Yes!",
            // cancelButtonText: "No!",
            closeOnConfirm: false,
            closeOnCancel: true,
        }, function (isConfirm) {
            if (isConfirm) {
                master.selected.ModeUpdate("approve")
                // master.selected.Remark(""); // fill blank remakr // remark now can fill when approve
                // master.submitMaster();

                master.ApproveAction(Ids, IsApproveAction , false, master.selected.Remark() , function(data) {
                    $('#modal-form-master').modal('hide')
                    master.refreshMasterData()
                })
            }
        });
    } else {
        if (master.selected.Remark() == "") {
            swal("Oops", "Remark is empty and needed for reject reason", "error")
            return
        }
        swal({
            title: 'Are you sure want to reject ' + viewModel.getActionStringFromPending(master.selected.PendingStatus()) + ' ?',
            text: "You won't be able to revert this. Remark is needed for reject reason.",
            type: 'warning',
            showCancelButton: true,
            // confirmButtonClass: "btn-danger",
            // confirmButtonText: "Yes!",
            // cancelButtonText: "No!",
            closeOnConfirm: false,
            closeOnCancel: true,
        }, function (isConfirm) {
            if (isConfirm) {
                master.selected.ModeUpdate("reject")
                // master.submitMaster();

                master.ApproveAction(Ids, IsApproveAction , false, master.selected.Remark() , function(data) {
                    $('#modal-form-master').modal('hide')
                    master.refreshMasterData()
                })
            }
        });
    }
}

$(function () {
    master.initMasterData()
    master.initAutocomplete()
    master.initFilter()
    master.refreshComboboxData();
    master.initTooltip();
    master.refreshInfo();
    
    // load role
    master.loadRole();

    // new
    master.initAutocompleteTarget("Tier 1")

    // Init Upload
    master.initFormUpload()

    // Init References
    master.initReferences()

    // Init List Box
    master.initListBox()

    // $('#modal-mapping-project').on('shown.bs.modal', function() {
    //     var multiselect = $("#projects_mapping").data("kendoMultiSelect");
    //     multiselect.open();
    // })

    // $('#modal-mapping-project').on('hidden.bs.modal', function () {
    //     // do something…
    //     var multiselect = $("#projects_mapping").data("kendoMultiSelect");
    //     multiselect.close();
    // })

    // Checkbox START
    $("body").on("click" , "#div_mapping_mapping input[type=checkbox]" , function(e , o) {
        idx = $(e.target)[0].id
        isChecked = document.getElementById(idx).checked
        listBox = $("#mapping_mapping").data("kendoListBox")
        dataItems = listBox.dataSource.view()

        row = -1
        $.each(dataItems, function(r , o) {
            if (o.Id == idx.substr(3 , idx.length)) {
                row = r
            }
        })
        dataItem = dataItems[row]
        
        ar_ind = sel.MappingId.indexOf(dataItem.Id);

        if (ar_ind == -1) {
            sel.Mappings.push(dataItem)
            sel.MappingId.push(dataItem.Id)
            $("#MP_"+ dataItem.Id).prop("checked" , true)

            // listBox.select(listBox.items().first());
        } else {
            sel.Mappings.splice(ar_ind , 1)
            sel.MappingId.splice(ar_ind , 1)

            $("#MP_" + dataItem.Id).prop("checked" , false)

            $("#MP_" + dataItem.Id).parent().parent().toggleClass('k-state-selected')
        }

        $.each(sel.MappingId , function(k , v) {
            $("#MP_" + v).parent().parent().addClass('k-state-selected')
        })  
        
        master.selectedMasterProjectMapping.Mappings(sel.Mappings)
        master.selectedMasterProjectMapping.MappingId(sel.MappingId)

        // aa
        isChecked = true
        $.each(dataItems , function(r , dataItem){
            ar_ind = sel.MappingId.indexOf(dataItem.Id)
            if (ar_ind == -1) {
                isChecked = false
            }
        })
        $("#GRID_MAP_MAP_ALL").prop("checked" , isChecked)
    })

    $("body").on("click" , "#div_projects_mapping input[type=checkbox]" , function(e , o) {
        idx = $(e.target)[0].id
        isChecked = document.getElementById(idx).checked
        listBox = $("#projects_mapping").data("kendoListBox")
        dataItems = listBox.dataSource.view()

        row = -1
        $.each(dataItems, function(r , o) {
            if (o.Id == idx) {
                row = r
            }
        })
        dataItem = dataItems[row]

        ar_ind = sel.ProjectId.indexOf(dataItem.Id);

        if (ar_ind == -1) {
            row = master.newProject()
            
            row.ProjectId   = dataItem.Id +""
            row.ProjectCode = dataItem.Value
            row.ProjectName = dataItem.Name
            $("#" + dataItem.Id).prop("checked" , true)

            sel.Projects.push(row)
            sel.ProjectId.push(dataItem.Id)
        } else {
            sel.Projects.splice(ar_ind , 1)
            sel.ProjectId.splice(ar_ind , 1)
            $("#" + dataItem.Id).prop("checked" , false)

            $("#" + dataItem.Id).parent().parent().toggleClass('k-state-selected')
        }

        $.each(sel.ProjectId , function(k , v) {
            $("#" + v).parent().parent().addClass('k-state-selected')
        })

        $("#GRID_MAP_PROJECT_ALL").prop("checked" , sel.ProjectId.length == $("#projects_mapping").data("kendoListBox").dataSource.view().length)

        master.selectedMasterProjectMapping.Projects(sel.Projects)
        master.selectedMasterProjectMapping.ProjectId(sel.ProjectId)
    });

    // All
    $("body").on("click","#cb_grid_checked",function(e) {
        $("body input.grid_checked").prop("checked" , $(this).is(':checked'))
        var grid = $('.grid-master-data').data('kendoGrid');
        var view = grid.dataSource.view();
        $.each(view , function(r , o) {
            id = ""+o.Id
            ar_ind = master.gridChecked().indexOf(id)
            if (!$(e.target).is(':checked')) {
                if (ar_ind != -1) {
                    master.gridChecked().splice(ar_ind , 1)
                }
            } else {
                if (ar_ind == -1) {
                    master.gridChecked().push(id)
                }
            }
        })
    })

    // Single
    $("body").on("click",".grid_checked", function(e){
        var grid = $('.grid-master-data').data('kendoGrid');
        var view = grid.dataSource.view()
        var checked = true
        if (!$(this).is(':checked')) {
            ar_ind = master.gridChecked().indexOf($(this).attr("id"))

            master.gridChecked().splice(ar_ind , 1)
        } else {
            master.gridChecked().push($(this).attr("id"))
        }

        $.each(view , function(r , o) {
            ar_ind = master.gridChecked().indexOf(""+o.Id)
            if (ar_ind == -1) {
                checked = false
            }
        })
        $("#cb_grid_checked").prop("checked" , checked)
    })
    // Checkbox END

    // Add Dragable
    $("#modal-insert > .modal-dialog").draggable()
    $("#modal-options > .modal-dialog").draggable()
    $("#modal-mapping-project > .modal-dialog").draggable()
    $("#modal-upl-mapping > .modal-dialog").draggable()
    $("#modal-detail > .modal-dialog").draggable()
    $('#modal-reference-' + "mapping > .modal-dialog").draggable()
    $('#modal-reference-' + "dpr > .modal-dialog").draggable()
})

master.initTooltip = function() {
    viewModel.prepareTooltipster($("#form-master").find('[data-tooltipster]'))
    viewModel.prepareTooltipster($("#filter_list").find('[data-tooltipster]'))

    $('body .rounded').kendoTooltip({
        filter: '.k-dropdown',
        position: 'top',
        content: function(e){
            return $(e.target).find("select").data("tooltipster");
        },
    });
    
    var target_obj = $("#targetObject").data("kendoDropDownList")
    $('body ul#targetObject_listbox').kendoTooltip({
        filter: 'li.k-item',
        position: 'right',
        content: function(e){
          var item = target_obj.dataItem($(e.target));
          var result = "<div>"+
                            "<div>Id : "+item.Id+"</div>" +
                            "<div>Logical Name : "+item.LogicalName+"</div>"+
                        "</div>";
    
          return result;
        },
        width: "250",
    });

    var target_attr = $("#targetStructure").data("kendoDropDownList")
    $('body ul#targetStructure_listbox').kendoTooltip({
        filter: 'li.k-item',
        position: 'right',
        content: function(e){
          var item = target_attr.dataItem($(e.target));
          var result = "<div>"+
                            "<div>Id : "+item.Id+"</div>" +
                            "<div>Logical Name : "+item.LogicalName+"</div>"+
                        "</div>";
    
          return result;
        },
        width: "250",
    });
    
    var src_obj = $("#sourceObject").data("kendoDropDownList")
    $('body ul#sourceObject_listbox').kendoTooltip({
        filter: 'li.k-item',
        position: 'right',
        content: function(e){
          var item = src_obj.dataItem($(e.target));
          var result = "<div>"+
                            "<div>Id : "+item.Id+"</div>" +
                            "<div>Logical Name : "+item.LogicalName+"</div>"+
                        "</div>";
    
          return result;
        },
        width: "250",
    });
    
    var src_attr = $("#sourceStructure").data("kendoDropDownList")
    $('body ul#sourceStructure_listbox').kendoTooltip({
        filter: 'li.k-item',
        position: 'right',
        content: function(e){
          var item = src_attr.dataItem($(e.target));
          var result = "<div>"+
                            "<div>Id : "+item.Id+"</div>" +
                            "<div>Logical Name : "+item.LogicalName+"</div>"+
                        "</div>";
    
          return result;
        },
        width: "250",
    });

    // sourceObject_taglist
    // var src_attr2 = $("#mapping_mapping").data("kendoListBox")
    $('body div#div_mapping_mapping').kendoTooltip({
        filter: 'li.k-item',
        position: 'right',
        content: function(e){
            // master.dataSourceObject(res.Data)
            ar_find = $.grep(master.dataMappingProject() , function(o) {
                return o.Id == e.target[0].innerText
            })
            // // var item = src_attr2.dataItem($(e.target));
            var result = ""
            if (ar_find[0].Sources.length > 0) {
                result = "<div>"+
                            "<div>Source Object Name : "+ar_find[0].Sources[0].SourceObjectPhysicalName+"</div>" +
                            "<div>Source Attribute Name : "+ar_find[0].Sources[0].SourceAttrPhysicalName+"</div>" +
                            "<div>Target Object Name : "+ar_find[0].TargetObjectPhysicalName+"</div>" +
                            "<div>Target Attribute Name : "+ar_find[0].TargetAttrPhysicalName+"</div>" +
                        "</div>";
            } else {
                result = "<div>"+
                        "<div>Source Object Name : </div>" +
                        "<div>Source Attribute Name : </div>" +
                        "<div>Target Object Name : "+ar_find[0].TargetObjectPhysicalName+"</div>" +
                        "<div>Target Attribute Name : "+ar_find[0].TargetAttrPhysicalName+"</div>" +
                    "</div>";
            }
    
          return result;
        },
        width: "250",
    });

    $('body div#div_projects_mapping').kendoTooltip({
        filter: 'label',
        position: 'right',
        content: function(e){
            var result = $(e.target).data("tooltipster");
    
          return result;
        },
        width: "100",
    });

    $('body #form-detail').kendoTooltip({
        filter: 'label',
        position: 'right',
        content: function(e){
            var result = $(e.target).data("tooltipster");
    
          return result;
        },
        width: "100",
    });

}

master.lblShowMore = ko.observable("Show More")
master.ShowDetail = ko.observable(false)
master.ShowDetail.subscribe(function(o) {
    if (o) {
        master.lblShowMore("Show Less")
    } else {
        master.lblShowMore("Show More")
    }

    master.refreshMasterData()
})

// Add Filter START
master.filterDataDropdown = function() {
    return {
        sysname : "",
        objphyname : "",
        attrphyname : "",
        mapversion : "",
        isprod : "",
    }
}

master.filterDropdown = ko.mapping.fromJS(master.filterDataDropdown())
master.objsysname = ko.observableArray([])
master.objphyname = ko.observableArray([])
master.attrphyname = ko.observableArray([])
master.mapversion = ko.observableArray([])
master.isprod = ko.observableArray([])

master.initFilter = function(ids) {
    var payload = {
        FieldReq : "system",
        AdditionalFilter : {},
        BetweenFieldLogic : "AND",
        WithinFieldLogic : "OR",
    }
    
    payload.ObjectSystemName = master.filterDropdown.sysname()
    payload.ObjectPhysicalName = master.filterDropdown.objphyname()
    payload.AttributePhysicalName = master.filterDropdown.attrphyname()
    payload.MappingVersion = master.filterDropdown.mapversion()
    payload.Production = master.filterDropdown.isprod()
    if (payload.Production != "") {
        payload.Production = (payload.Production == "Yes") + ""
    }

    // get
    // payload.SortField = "Name"
    // payload.SortType = "1"
    payload.FieldReq = "system"
    payload.FieldReqs = {
        "Id" : "" ,
        "Name" : "" ,
    }
    hostedPayloadsys = $.extend(true,{}, payload);
    if (ids == "f_OBJ_SYS_NM") {
        hostedPayloadsys.ObjectSystemName = ""
    }
    // dicopy
    viewModel.ajaxPost('/mapping/getfilterdefinition', hostedPayloadsys, function(res) {
        master.objsysname(res.Data)
    })

    // DEFINITION START
    // payload.SortField = "PhysicalName"
    // payload.SortType = "1"
    payload.FieldReq = "object"
    payload.FieldReqs = {
        "PhysicalName" : "" ,
    }
    // payload.SortField = "_id.PhysicalName"
    // payload.SortType = "1"
    payload.SkipAddEmptyData = true
    hostedPayloadobj = $.extend(true,{}, payload);
    if (ids == "f_OBJ_PHY_NM") {

        hostedPayloadobj.ObjectPhysicalName = ""
    }
    viewModel.ajaxPost('/mapping/getfilterdefinition', hostedPayloadobj, function(res) {
        master.objphyname(res.Data)
    })
    // DEFINITION END
    
    // Attr START
    // payload.SortField = "structures.physicalname"
    // payload.SortType = "1"
    payload.FieldReq = "attribute"
    payload.FieldReqs = {
        "PhysicalName" : "" ,
    }
    // payload.SortField = "_id.PhysicalName"
    // payload.SortType = "1"
    payload.SkipAddEmptyData = true
    hostedPayloadattr = $.extend(true,{}, payload);
    if (ids == "f_ATTR_PHY_NM") {
        hostedPayloadattr.AttributePhysicalName = ""
    }
    viewModel.ajaxPost('/mapping/getfilterdefinition', hostedPayloadattr, function(res) {
        master.attrphyname(res.Data)// 
    })
    // Attr END

    // Mapping version
    payload.FieldReq = "mapversion"
    payload.FieldReqs = {
        "_id" : "mapversion"
    }
    payload.SortField = "_id._id"
    payload.SortType = "1"
    payload.SkipAddEmptyData = true
    hostedPayloadmap = $.extend(true,{}, payload);
    if (ids == "f_MAP_VER") {
        hostedPayloadmap.MappingVersion = ""
    }

    viewModel.ajaxPost("/mapping/getfilterdefinition", hostedPayloadmap, function (res) {
        master.mapversion([])
        master.mapversion(ko.mapping.fromJS(res.Data)())
    });

    // PROD
    payload.FieldReq = "isprod"
    payload.FieldReqs = {
        "_id" : "isprod"
    }
    payload.SortField = "_id._id"
    payload.SortType = "1"
    hostedPayloadprd = $.extend(true,{}, payload);
    hostedPayloadprd.SkipAddEmptyData = true
    if (ids == "f_IS_PROD") {
        hostedPayloadprd.Production = ""
    }

    viewModel.ajaxPost("/mapping/getfilterdefinition", hostedPayloadprd, function (res) {
        master.isprod([])
        master.isprod(ko.mapping.fromJS(res.Data)())
    });
}

master.selectedfilter = function(o) {
    if (o.sender.element[0].id == "f_OBJ_PHY_NM") {
        master.filterDropdown.objphyname(o.dataItem.PhysicalName)
        // f_ATTR_PHY_NM
    } else if (o.sender.element[0].id == "f_ATTR_PHY_NM") {
        val = (o.dataItem == "Attribute Physical Name" ? "" : o.dataItem)
        master.filterDropdown.attrphyname(o.dataItem.PhysicalName)
    } else if (o.sender.element[0].id == "f_MAP_VER") {
        master.filterDropdown.mapversion(o.dataItem._id)
    } else if (o.sender.element[0].id == "f_IS_PROD") {
        master.filterDropdown.isprod((o.dataItem._id) + "")
    } else if (o.sender.element[0].id == "f_OBJ_SYS_NM") {
        master.filterDropdown.sysname(o.dataItem.Id)
    }

    master.initFilter(o.sender.element[0].id)

    // Reset Grid to page One 
    var grid = $(".grid-master-data").data("kendoGrid");  
    grid.dataSource.page(1);

    // master.refreshMasterData();
}

// Add Filter END
master.newProject = function () {
    return {
        ProjectId: "",
        ProjectCode: "",
        ProjectName: ""
    }
}

master.projectsList = []

master.detail = function(Id) {
    master.projectsList = [];
    // aa
    var data = master.dataMasterData().find(function (d) { return d.Id == Id })

    if (data.Projects != null) {
        $("#projects option").each(function(id)
        {
            $("#PR_" + $(this).val()).prop("checked" , false)
            $("#PR_" + $(this).val()).parent().parent().removeClass('k-state-selected')
            // Add $(this).val() to your list
        });

        data.ProjectsId = data.Projects.map(function (e) {
            master.projectsList.push(e);

            $("#PR_" + e.ProjectId).prop("checked" , true)
            $("#PR_" + e.ProjectId).parent().parent().addClass('k-state-selected')
    
            return e.ProjectId
        })
    } else {
        data.ProjectsId = []
    }

    data["ModeUpdate"] = "detail"

    ko.mapping.fromJS(data, master.selected)
    $('#modal-detail').modal({
        show: true,
        backdrop: 'static',
        keyboard: false, // prevent esc
    })
    // Reset the css from drag position
    $("#modal-detail > .modal-dialog").css("left", "0").css("top", "0");

    setTimeout(function () { viewModel.isFormValid('#modal-detail form') }, 310)
}

master.projectSelected = function(o) {
    var listBox = $("#projects").data("kendoListBox");
    var index = this.select().index(),
        dataItem = this.dataSource.view()[index];

    ar_ind = master.projectsList.findIndex(i => i.ProjectId === dataItem.Id)

    if (ar_ind == -1) {
        row = master.newProject()
        
        row.ProjectId   = dataItem.Id +""
        row.ProjectCode = dataItem.Value
        row.ProjectName = dataItem.Name
        $("#PR_" + dataItem.Id).prop("checked" , true)

        master.projectsList.push(row);
    } else {
        master.projectsList.splice(ar_ind , 1);
        $("#PR_" + dataItem.Id).prop("checked" , false)

        $("#PR_" + dataItem.Id).parent().parent().toggleClass('k-state-selected')
    }

    $.each(master.projectsList , function(k , v) {
        $("#PR_" + v.ProjectId).parent().parent().addClass('k-state-selected')
    })  

    // if (master.projectsList.findIndex(i => i.ProjectId === o.dataItem.Id) != -1) {
    //     return;
    // }
    // row = master.newProject()

    // row.ProjectId   = o.dataItem.Id +""
    // row.ProjectCode = o.dataItem.Value
    // row.ProjectName = o.dataItem.Name
    // master.projectsList.push(row);
    // master.selected.Projects().push(row)
}

master.projectDeselected = function(o) {
    i = master.projectsList.findIndex(i => i.ProjectId === o.dataItem.Id);

    master.projectsList.splice(i , 1);
}

master.refreshFilter = function() {
    master.filterDropdown.sysname("") 
    master.filterDropdown.objphyname("") 
    master.filterDropdown.attrphyname("") 
    master.filterDropdown.mapversion("") 
    master.filterDropdown.isprod("") 
    var filter = $("#f_OBJ_SYS_NM").data("kendoDropDownList");
    filter.select(0);

    var filter = $("#f_OBJ_PHY_NM").data("kendoDropDownList");
    filter.select(0);
    
    filter = $("#f_ATTR_PHY_NM").data("kendoDropDownList");
    filter.select(0); 
    
    filter = $("#f_MAP_VER").data("kendoDropDownList");
    filter.select(0); 

    filter = $("#f_IS_PROD").data("kendoDropDownList");
    filter.select(0); 

    master.initFilter()
    master.refreshMasterData();
}

master.SourceObjectSelect = function(o) {
    master.dataSourceStructure([])
    objid = o

    // put ar_struct
    ar_struct = []
    $.each(o.dataItem.Structures , function(r , o){
        // if (o.IsActive && o.Status == STATUS_APPROVED || !master.isSetDataFinish()) {
            o["Sources"] = {
                SourceObjectId : objid.dataItem.Id,
                SourceObjectPhysicalName : objid.dataItem.PhysicalName,
                SourceObjectLogicalName : objid.dataItem.LogicalName,
    
                SourceAttrId : o.Id,
                SourceAttrPhysicalName : o.PhysicalName,
                SourceAttrLogicalName : o.LogicalName,
            }
            ar_struct.push(o)
            ar_struct_id.push(o.Id) //
        // }
    })
    ar_struct_selected_id = []
    ar_struct_selected = []

    master.dataSourceStructure(ar_struct)

    master.initAutocompleteSourceStructure("sourceStructure" ,  master.dataSourceStructure() , "s")

    // master.resetTargetFill()
}

master.SourceObjectDeSelect = function(e) {
    // Remove the structure
    if (e.dataItem.Structures.length > 0) {
        master.dataSourceStructure([])
        // get first row
        id = e.dataItem.Structures[0].Id;
        index = ar_struct_id.indexOf(id)

        ar_struct_id.splice(index, e.dataItem.Structures.length)
        ar_struct.splice(index, e.dataItem.Structures.length)
        
        master.dataSourceStructure(ar_struct)
        
        master.selected.Sources([])
        
        master.initAutocompleteSourceStructure("sourceStructure" ,  master.dataSourceStructure() , "s")
    }

    master.resetTargetFill()
}

// master.resetTargetFill = function() {
//     // reset target START
//     master.selected.TargetObjectPhysicalName("")
//     master.selected.TargetObjectId("")
//     master.selected.TargetObjectLogicalName("")

//     master.dataTargetStructure([])
//     master.initAutocompleteStructure("targetStructure" ,  master.dataTargetStructure() , "t")

//     master.selected.TargetAttrId("")
//     master.selected.TargetAttrPhysicalName("")
//     master.selected.TargetAttrLogicalName("")

//     var target_obj = $("#targetObject").data("kendoDropDownList")
//     target_obj.dataSource.read()
//     // reset target END
// }

master.SourceTemplate = function(e) {
    el = $("#sourceObject").data("kendoDropDownList")
    var checked = "checked";
    if (el.value().indexOf(e.Id) == -1) {
        checked = "";
    }

    return "<label class='checkbox-inline' for="+e.Id+"x'><input type='checkbox' id='"+e.Id+"' "+checked+">"+e.PhysicalName+"</label>";
}

master.openSourceAttribute = function(e) {
    el = $("#sourceStructure").data("kendoDropDownList")
    // var checked = "checked";

    $.each(el.ul.find("li") , function(k , v) {
        li = $(v)

        li.find("input").prop("checked" , li.hasClass("k-state-selected"))
    })
}

master.SourceAttrTemplate = function(e) {
    el = $("#sourceStructure").data("kendoDropDownList");
    var checked = "checked";

    if (el.value().indexOf(e.Id) == -1) {
        checked = "";
    }

    return "<label class='checkbox-inline' for="+e.Id+"x'><input type='checkbox' id='"+e.Id+"' "+checked+">"+e.PhysicalName+"</label>";
}

master.selectSourceAttribute = function(o) {
    
    var items = this.ul.find("input#" + o.dataItem.Id);
    items.prop("checked" , true)

    ar_struct_selected_id.push(o.dataItem.Id)
    ar_struct_selected.push(o.dataItem.Sources)

    master.selected.Sources(ar_struct_selected)
}

master.deselectSourceAttribute = function(e) {
    var items = this.ul.find("input#" + e.dataItem.Id);
    items.prop("checked" , false)

    
    id = e.dataItem.Id;
    index = ar_struct_id.indexOf(id)
    
    ar_struct_selected_id.splice(index , 1)
    ar_struct_selected.splice(index , 1)
    
    master.selected.Sources(ar_struct_selected)
}

master.targetObjSelect = function(o) {
    master.dataTargetStructure([])
    Id = ""
    PhysicalName = ""
    LogicalName = ""
    if (o.dataItem != null) {
        ar_struct = []
        $.each(o.dataItem.Structures , function(r , o) {
            if (o.IsActive && o.Status == STATUS_APPROVED) {
                ar_struct.push(o)
            }
        })
        // master.dataTargetStructure(o.dataItem.Structures)
        master.dataTargetStructure(ar_struct)
        PhysicalName = o.dataItem.PhysicalName
        LogicalName = o.dataItem.LogicalName
        Id = o.dataItem.Id
    }

    master.initAutocompleteStructure("targetStructure" ,  master.dataTargetStructure() , "t")

    master.selected.TargetObjectId(Id)
    master.selected.TargetObjectPhysicalName(PhysicalName)
    master.selected.TargetObjectLogicalName(LogicalName)
}

master.targetAttrSelect = function(o) {
    // master.selected.TargetAttrId(o.dataItem.Id)
    master.selected.TargetAttrPhysicalName(o.dataItem.PhysicalName)
    master.selected.TargetAttrLogicalName(o.dataItem.LogicalName)
}

master.newMasterProjectMapping = function () {
    return {
        MappingId : [] ,
        ProjectId : [] ,
        Mappings : [] ,
        Projects : [] ,
    }
}
master.selectedMasterProjectMapping = ko.mapping.fromJS(master.newMasterProjectMapping())

master.mappingProject = function() {
    $("#GRID_MAP_MAP_ALL").prop("checked" , false)
    $("#GRID_MAP_PROJECT_ALL").prop("checked" , false)
    
    $("#mapping_mapping option").each(function(r , id)
    {
        idx = "#MP_" + $(id).val()
        $(idx).prop("checked" , false)
        $(idx).parent().parent().removeClass('k-state-selected')
        // Add $(this).val() to your list
    });
    
    $("#projects_mapping option").each(function(r , id)
    {
        idx = "#MP_" + $(id).val()
        $(idx).prop("checked" , false)
        $(idx).parent().parent().removeClass('k-state-selected')
        // Add $(this).val() to your list
    });

    // Reset
    ko.mapping.fromJS(master.newMasterProjectMapping(), master.selectedMasterProjectMapping)

    $('#modal-mapping-project').modal({
        show: true,
        backdrop: 'static',
        keyboard: false, // prevent esc
    })
    // Reset the css from drag position
    $("#modal-mapping-project > .modal-dialog").css("left", "0").css("top", "0");
}

master.projectMappingSelected = function(o) {
    sel = ko.mapping.toJS(master.selectedMasterProjectMapping)
    
    if (o.sender.element[0].id == "mapping_mapping") {
        var listBox = $("#mapping_mapping").data("kendoListBox");
        var index = this.select().index(),
            dataItem = this.dataSource.view()[index];
        
        ar_ind = sel.MappingId.indexOf(dataItem.Id);

        if (ar_ind == -1) {
            sel.Mappings.push(dataItem)
            sel.MappingId.push(dataItem.Id)
            $("#MP_"+ dataItem.Id).prop("checked" , true)

            // listBox.select(listBox.items().first());
        } else {
            sel.Mappings.splice(ar_ind , 1)
            sel.MappingId.splice(ar_ind , 1)

            $("#MP_" + dataItem.Id).prop("checked" , false)

            $("#MP_" + dataItem.Id).parent().parent().toggleClass('k-state-selected')
        }

        $.each(sel.MappingId , function(k , v) {
            $("#MP_" + v).parent().parent().addClass('k-state-selected')
        })  
        
        master.selectedMasterProjectMapping.Mappings(sel.Mappings)
        master.selectedMasterProjectMapping.MappingId(sel.MappingId)

        // aa
        isChecked = true
        $.each(this.dataSource.view() , function(r , dataItem){
            ar_ind = sel.MappingId.indexOf(dataItem.Id)
            if (ar_ind == -1) {
                isChecked = false
            }
        })
        $("#GRID_MAP_MAP_ALL").prop("checked" , isChecked)

    }
    else if (o.sender.element[0].id == "projects_mapping") {
        var listBox = $("#projects_mapping").data("kendoListBox");
        var index = this.select().index(),
            dataItem = this.dataSource.view()[index];
        
        // ar_ind = sel.Projects.findIndex(i => i.ProjectId === dataItem.Id);
        ar_ind = sel.ProjectId.indexOf(dataItem.Id);

        if (ar_ind == -1) {
            row = master.newProject()
            
            row.ProjectId   = dataItem.Id +""
            row.ProjectCode = dataItem.Value
            row.ProjectName = dataItem.Name
            $("#" + dataItem.Id).prop("checked" , true)

            sel.Projects.push(row)
            sel.ProjectId.push(dataItem.Id)
        } else {
            sel.Projects.splice(ar_ind , 1)
            sel.ProjectId.splice(ar_ind , 1)
            $("#" + dataItem.Id).prop("checked" , false)

            $("#" + dataItem.Id).parent().parent().toggleClass('k-state-selected')
        }

        $.each(sel.ProjectId , function(k , v) {
            $("#" + v).parent().parent().addClass('k-state-selected')
        })

        $("#GRID_MAP_PROJECT_ALL").prop("checked" , sel.ProjectId.length == $("#projects_mapping").data("kendoListBox").dataSource.view().length)

        master.selectedMasterProjectMapping.Projects(sel.Projects)
        master.selectedMasterProjectMapping.ProjectId(sel.ProjectId)
    }

}

master.projectMappingDeselected = function(o) {
    sel = ko.mapping.toJS(master.selectedMasterProjectMapping)
    id = o.dataItem.Id

    if (o.sender.element[0].id == "mapping_mapping") {
        index = sel.MappingId.indexOf("MP_"+id);

        sel.Mappings.splice(index , 1)
        master.selectedMasterProjectMapping.Mappings(sel.Mappings)
    }
    else if (o.sender.element[0].id == "projects_mapping") {
        index = sel.ProjectId.indexOf(id);
        
        sel.Projects.splice(index , 1)
        master.selectedMasterProjectMapping.Projects(sel.Projects)
    }
}

master.storeMasterDataMultiple = function() {
    payload = ko.mapping.toJS(master.selectedMasterProjectMapping)

    if (payload.Mappings.length == 0) {
        swal("Error!", "Please select one Mapping !", "error")
        return;
    }

    if (payload.Projects.length == 0) {
        swal("Error!", "Please select one Project !", "error")
        return;
    }

    payload.Mappings = $.each(payload.Mappings , function(row , o) {
        o.Projects = payload.Projects
    })
    
    viewModel.ajaxPost('/mapping/createmulti', payload.Mappings, function (data) {
        if (!data.IsError) {
            swal({
                title: 'Success',
                text: 'Changes saved',
                type: 'success',
                timer: 2000,
                showConfirmButton: false
            })
            
            $('#modal-mapping-project').modal('hide')
            master.refreshMasterData()
        }
        else {
            swal("Error!", data.Message, "error")
        }
        
    })
}

// Import Start

master.uplFormActive = ko.observable("")

master.initFormUpload = function() {
    var avaiableExt = [".xlsx"];

    $("#upload-mapping").kendoUpload({
        async: {
            saveUrl: "/mapping/import",
            // removeUrl: "http://my-app.localhost/remove",
            autoUpload: false
        },
        error: function(e) {
        },
        progress: function(e) {
        },
        success: function(e) {
            if (e.operation == "upload") {
                if (!e.response.IsError) {
                    name = e.files[0].name;

                    swal("Success!", "Upload "+name+" Success", "success");
                    $('#' + master.uplFormActive()).modal('hide')

                    master.refreshMasterData()
                } else {
                    swal("Error!", e.response.Message, "error")
                }
                
            }
        },
        complete: function(e) {
            viewModel.isLoading(false)
        },
        upload: function(e){
            viewModel.isLoading(true)
        },
        localization: {
            invalidFileExtension: "File is not allowed, allowed only for " + (avaiableExt.join(","))
        },
        validation: {
            allowedExtensions: avaiableExt,
        },
        multiple: false
    });
}

master.importExcel = function(o) {
    // Open Upload Form
    master.uplFormActive("modal-upl-" + o)
    $('#' + master.uplFormActive()).modal({
        show: true,
        backdrop: 'static',
        keyboard: false, // prevent esc
    })
    // Reset the css from drag position
    $('#' + master.uplFormActive() + " > .modal-dialog").css("left", "0").css("top", "0");

    // Reset upload form
    var upload = $("#upload-" + o).data("kendoUpload");
    upload.removeAllFiles();

    // Remove uploaded file
    $(".k-upload-files.k-reset").find("li").remove();
    $(".k-upload-status.k-upload-status-total").remove();
}

// Import End

// Refrences START

master.dataMasterReferences = ko.observableArray([])
master.dataMasterReferencesDPR = ko.observableArray([])

master.referencesOpen = function(flag) {

    // refresh
    var grid = $(".grid-references-" + flag).data("kendoGrid");
    grid.dataSource.filter({});
    // grid.dataSource.read();
    grid.refresh();
    
    $('#modal-reference-' + "mapping").modal('hide')
    $('#modal-reference-' + "dpr").modal('hide')

    $('#modal-reference-' + flag).modal({
        show: true,
        backdrop: 'static',
        keyboard: false, // prevent esc
    })

    // Reset the css from drag position
    $('#modal-reference-' + "mapping > .modal-dialog").css("left", "0").css("top", "0");
    $('#modal-reference-' + "dpr > .modal-dialog").css("left", "0").css("top", "0");
}

master.initReferences = function() {
    master.dataMasterReferences([])
    var payload = ko.mapping.toJS(master.filter);
    var columns = [
        {
            field: 'ObjectId',
            title: 'Object Id', width: "200px"
        },
        {
            field: 'ObjectPhysicalName',
            title: 'Object Physical Name', width: "200px"
        },
        {
            field: 'ObjectLogicalName',
            title: 'Object Logical Name', width: "200px"
        },
        {
            field: 'StructureId',
            title: 'Structure Id', width: "200px"
        },
        {
            field: 'StructurePhysicalName',
            title: 'Structure Physical Name', width: "200px"
        },
        {
            field: 'StructureLogicalName',
            title: 'Structure Logical Name', width: "200px"
        },
        {
            field: 'SourceSystemName',
            title: 'Source System Name', width: "200px"
        },
        {
            field: 'CountryName',
            title: 'Country Name', width: "200px"
        },
    ]

    var config = {
        dataSource: {
            transport: {
                read: function(opt) {
                    payload.Page = opt.data.page -1;
                    payload.PerPage = opt.data.take;
                    payload.SortField = "_id";
                    payload.SortType = "-1";
                    if(opt.data.sort && opt.data.sort.length > 0) {
                        payload.SortField = opt.data.sort[0].field.slice(opt.data.sort[0].field.indexOf(".") + 1);
                        payload.SortType = opt.data.sort[0].dir;
                    }
                    payload.AdditionalFilter = {};
                    if(opt.data.filter) {
                        _.each(opt.data.filter.filters, function(f) {
                            var field = f.field;
                            var fieldName = "";
                            if (field.substr(field.indexOf(".") + 1) == "ObjectId") {
                                fieldName = "_Id"
                            } else if (field.substr(field.indexOf(".") + 1) == "ObjectPhysicalName") {
                                fieldName = "physicalname"
                            } else if (field.substr(field.indexOf(".") + 1) == "ObjectPhysicalName") {
                                fieldName = "logicalname"
                            } 
                            else if (field.substr(field.indexOf(".") + 1) == "StructureId") {
                                fieldName = "structures.id"
                            } else if (field.substr(field.indexOf(".") + 1) == "StructurePhysicalName") {
                                fieldName = "structures.physicalname"
                            } else if (field.substr(field.indexOf(".") + 1) == "StructureLogicalName") {
                                fieldName = "structures.logicalname"
                            } else if (field.substr(field.indexOf(".") + 1) == "SourceSystemName") {
                                fieldName = "sourcesystemname"
                            } 
                            else if (field.substr(field.indexOf(".") + 1) == "CountryName") {
                                fieldName = "countryname"
                            }

                            payload.AdditionalFilter[fieldName] = [{
                                Type: f.operator,
                                Value: f.value
                            }]
                        })
                    }
                    
                    viewModel.ajaxPost('/objectdefinition/getjoinefstruct', payload, function(res) {
                        master.dataMasterReferences(res.Data)
                        opt.success({data: res.Data, total: res.Total});
                    })
                }
            },
            schema: {
                data: "data",
                total: "total",
            },
            pageSize: 20,
            serverPaging: true,
            serverSorting: true,
            serverFiltering: true,
        },
        pageable: true,
        sortable: true,
        filterable: {
            extra: false,
            operators: {
                string: {
                    contains: "Contains",
                    startswith: "Starts With",
                    notcontains: "Does Not Contain",
                    endswith: "Ends With",
                    isempty: "Empty"
                }
            }
        },
        columns:  columns,
        dataBound: function (e) {
            var grid = this;
            grid.tbody.find("tr").on("click", function (e) {
                var dataItem = grid.dataItem(this);
                master.selected.RefferenceAttrId(dataItem.StructureId)

                $('#modal-reference-mapping').modal('hide')
            });
        },
    }

    $('.grid-references-mapping').kendoGrid(config)

    master.initReferencesDPR()
}

master.initReferencesDPR = function() {
    master.dataMasterReferencesDPR([])
    var payload = ko.mapping.toJS(master.filter);
    var columns = [
        {
            field: 'DataProcessingRuleName',
            title: 'Name',
            width: 200,
        },
        {
            field: 'SourceObjectPhysicalName',
            title: 'Source Object Physical Name',
            width: 200,
        },
        {
            field: 'SourceAttributePhysicalName',
            title: 'Source Attribute Physical Name',
            width: 200,
        },
        {
            field: 'TargetObjectPhysicalName',
            title: 'Target Object Physical Name',
            width: 200,
        },
        {
            field: 'TargetAttributePhysicalName',
            title: 'Target Attribute Physical Name',
            width: 200,
        },
        {
            field: 'ProcessType',
            title: 'Process Type',
            width: 200,
        },
        {
            field: 'MapNote',
            title: 'Map Note',
            width: 200,
        },
    ]

    var config = {
        // dataSource: master.dsDpr,
        dataSource: new kendo.data.DataSource(
            {
                transport : {
                    read : function(opt) {
                        var payload = {
                            FieldReqs : {} ,
                            AdditionalFilter : {}
                        }
                        payload.AdditionalFilter = {};
                        if (opt.data.filter) {
                            _.each(opt.data.filter.filters, function (f) {
                                var field = f.field;
                                payload.AdditionalFilter[field.substr(field.indexOf(".") + 1)] = [{
                                    Type: f.operator,
                                    Value: f.value
                                }]
                            })
                            }
                        payload.SortField = "DataProcessingRuleName".toLowerCase()
                        payload.SortType = "1"
                        payload.Page = opt.data.page -1;
                        payload.PerPage = opt.data.take;
                    
                        payload.AdditionalFilter["IsSourceAvailable"] = [
                            {
                                Type: "eq",
                                Value: master.selected.IsDprAsSource() + ""
                            }
                        ]
                        payload.AdditionalFilter["IsActive"] = [
                            {
                                Type: "eq",
                                Value: "true"
                            }
                        ]
                        payload.AdditionalFilter["Status"] = [
                            {
                                Type: "eq",
                                Value: STATUS_APPROVED.toString()
                            }
                        ]
        
                        viewModel.ajaxPost("/dataprocessingrule/get", payload, function (data) {
                            opt.success({data : data.Data , total : data.Total});
                        })
                    }       
                },
                schema: {
                    data: 'data',
                    total: 'total',
                },
                pageSize: 10,
                serverPaging: true,
                serverSorting: true,
                serverFiltering: true,
            }
        ),
        pageable: true,
        sortable: true,
        filterable: {
            extra: false,
            operators: {
                string: {
                    contains: "Contains",
                    startswith: "Starts With",
                    notcontains: "Does Not Contain",
                    endswith: "Ends With",
                    isempty: "Empty"
                }
            }
        },
        columns:  columns,
        dataBound: function (e) {
            var grid = this;

            $.each(grid.tbody.children() , function(k , v) {
                o = grid.dataSource.view()[k];
                if (master.selected.DataProcessingRuleId() == o.Id) {
                    $(v).css("background-color" , "#23639A")
                    $(v).css("color" , "#fff")
                }
            })


            grid.tbody.find("tr").on("click", function (e) {
                var dataItem = grid.dataItem(this);

                dpr = $("#dpr_drop").data("kendoDropDownList")
                dpr.value(dataItem.Id)
                dpr.trigger("change")

                master.selected.DataProcessingRuleId(dataItem.Id)

                $('#modal-reference-dpr').modal('hide')
            });
        },
    }

    $('.grid-references-dpr').kendoGrid(config)
}

// Refrences END

master.MappingTemplate = function(e) {

    return "<label class='checkbox-inline' for='"+e.Id+"x'><input type='checkbox' id='MP_"+e.Id+"' >"+e.Id+"</label>";
    // return "<label class='checkbox-inline'>"+e.Id+"</label>";
}

master.MappingProjectTemplate = function(e) {

    return "<label class='checkbox-inline' for="+e.Id+"x' data-tooltipster='"+e.Id+"'><input type='checkbox' id='PR_"+e.Id+"' >"+e.Name+"</label>";
    // return "<label class='checkbox-inline'>"+e.Id+"</label>";
}

master.ProjectTemplate = function(e) {
    el = $("#projects_mapping").data("kendoMultiSelect")
    var checked = "checked";
    if (el.value().indexOf(e.Id) == -1) {
        checked = "";
    }

    return "<label class='checkbox-inline' for="+e.Id+"x'><input type='checkbox' id='"+e.Id+"' "+checked+">"+e.Name+"</label>";
}

// DB Name START

master.SourceTemplateDBName = function(e) {
    el = $("#sourceObjectDBName").data("kendoDropDownList")
    var checked = "checked";
    if (el.value().indexOf(e.Id) == -1) {
        checked = "";
    }

    return "<label class='checkbox-inline' for="+e.Id+"x'><input type='checkbox' id='"+e.Id+"' "+checked+">"+e.DBName+"</label>";
}

master.SourceObjectDeSelectDBName = function(o) {
    objid = o

    master.setLabelTier()

    $("#sourceObject").data("kendoDropDownList").dataSource.read()
    $("#targetObjectDBName").data("kendoDropDownList").dataSource.read()
    $("#targetObject").data("kendoDropDownList").dataSource.read()
}
// Source END

// DB Name END

master.initListBox = function() {
    $("#mapping_mapping").kendoListBox(
        { 
            dataSource: master.ListBoxMappingdataSource, 
            dataValueField: 'Id', 
            dataTextField: 'Id',  
            change: master.projectMappingSelected, 
            template: master.MappingTemplate,
            selectable: "single",
            placeholder: 'Select one',
            dataBound : function(o) {
                sel = ko.mapping.toJS(master.selectedMasterProjectMapping)
                // loop
                isChecked = true
                $.each(this.dataSource.view() , function(row , dataItem) {
                    ar_ind = sel.MappingId.indexOf("MP_"+dataItem.Id);

                    if (ar_ind != -1) {
                        $("#MP_" + dataItem.Id).prop("checked" , true)
                        $("#MP_" + dataItem.Id).parent().parent().addClass('k-state-selected')
                    } else {
                        $("#MP_" + dataItem.Id).prop("checked" , false)
                        $("#MP_" + dataItem.Id).parent().parent().removeClass('k-state-selected')
                        isChecked = false
                    }
                })
                $("#GRID_MAP_MAP_ALL").prop("checked" , isChecked)
            }
        }
    )

    $("#projects_mapping").kendoListBox(
        { 
            dataSource: master.ListBoxProjectdataSource, 
            dataValueField: 'Id', 
            dataTextField: 'Id',  
            change: master.projectMappingSelected, 
            template: function(e){
                return "<label class='checkbox-inline mapproject' for='"+e.Id+"x' data-tooltipster='"+e.Id+"'><input type='checkbox' id='"+e.Id+"' >"+e.Name+"</label>"
            },
            selectable: "single",
            placeholder: 'Select one'  
        }
    )

    $("#projects").kendoListBox(
        { 
            dataSource: master.ListBoxProjectdataSource, 
            dataValueField: 'Id', 
            dataTextField: 'Id',  
            change: master.projectSelected, 
            template: master.MappingProjectTemplate,
            placeholder: 'Select one'  
        }
    )

    // $("#pager").kendoPager({
    //     dataSource: master.ListBoxMappingdataSource
    // });
}

var payload = ko.mapping.toJS(master.filter);

master.ListBoxMappingdataSource = new kendo.data.DataSource({
    transport : {
        read : function(opt) {
            // payload.Page = opt.data.page -1;
            // payload.PerPage = opt.data.take;
            var payload = ko.mapping.toJS(master.filterObjectDef);
            payload.AdditionalFilter = {};
            // sources.sourcelogicalapplayername
            // Source START
            tgt_logical = $("#MP_SourceLogicalLayerName").data("kendoDropDownList").value()
            tgt_system = $("#MP_SourceSystemName").data("kendoDropDownList").value()
            tgt_objname = $("#MP_SourceObjectName").data("kendoDropDownList").value()

            if (tgt_logical != "Select Source Logical Layer" && tgt_logical != "") {
                payload.AdditionalFilter["sources.sourcelogicalapplayername"] = [{
                    Type: "eq",
                    Value: tgt_logical
                }]
            }
            if (tgt_system != "Select Source System Name" && tgt_system != "") {
                payload.AdditionalFilter["sources.sourcesystemid"] = [{
                    Type: "eq",
                    Value: tgt_system
                }]
            }
            if (tgt_objname != "Select Source Object Name" && tgt_objname != "") {
                payload.AdditionalFilter["sources.sourceobjectid"] = [{
                    Type: "eq",
                    Value: tgt_objname
                }]
            }
            // Source END
            
            // TARGET START
            tgt_logical = $("#MP_TargetLogicalLayerName").data("kendoDropDownList").value()
            tgt_system = $("#MP_TargetSystemName").data("kendoDropDownList").value()
            tgt_objname = $("#MP_TargetObjectName").data("kendoDropDownList").value()

            if (tgt_logical != "Select Target Logical Layer" && tgt_logical != "") {
                payload.AdditionalFilter["targetlogicalapplayername"] = [{
                    Type: "eq",
                    Value: tgt_logical
                }]
            }
            if (tgt_system != "Select Target System Name" && tgt_system != "") {
                payload.AdditionalFilter["targetsystemid"] = [{
                    Type: "eq",
                    Value: tgt_system
                }]
            }
            if (tgt_objname != "Select Target Object Name" && tgt_objname != "") {
                payload.AdditionalFilter["targetobjectid"] = [{
                    Type: "eq",
                    Value: tgt_objname
                }]
            }

            // TARGET END
            payload.PerPage = 0

            viewModel.ajaxPost('/mapping/get',payload,function(data){
                master.dataMappingProject(data.Data)
                opt.success({data : data.Data , total : data.Total});
            });
        }       
    },
    schema: {
        data: 'data',
        total: 'total',
    },
    pageSize: 10,
    serverPaging: true,
    serverSorting: true,
    serverFiltering: true,
});

master.ListBoxProjectdataSource = new kendo.data.DataSource(
    {
        transport : {
            read : function(opt) {
                payload = {
                    AdditionalFilter :{} ,
                    // Type : "PROJ_ID"
                }

                payload.AdditionalFilter["IsActive"] = [{
                    Type : "eq" ,
                    value : "true"
                }]
                payload.AdditionalFilter["Status"] = [{
                    Type : "eq" ,
                    value: STATUS_APPROVED.toString()
                }]

                viewModel.ajaxPost('/projectmaster/get',payload,function(data){
                    opt.success({data : data.Data , total : data.Total});
                });
            }       
        },
        schema: {
            data: 'data',
            total: 'total',
        },
        pageSize: 10,
        serverPaging: true,
        serverSorting: true,
        serverFiltering: true,
    }
);

master.ProjectMappingDataBound = function(e) {
}

// Delete START
master.deleteMaster = function(id, status, check = true) {
        // Cek Status
    var data = master.dataMasterData().find(function (d) { return d.Id == id })
    if (data.Status == STATUS_PENDING && check) {
        swal("Failed Delete!" , "Source to Target is in Pending "+data.PendingStatus+"  status. It is recommended that this Source to Target should be taken action by checker before further editing." , "error")
        return
    }
    
    // prevent tr clicked
    event = event || window.event;
    event.preventDefault();
    event.stopPropagation();

    swal({
        title: 'Are you sure want to delete this ?',
        text: "You won't be able to revert this.",
        type: 'warning',
        showCancelButton: true,
        // confirmButtonClass: "btn-danger",
        // confirmButtonText: "Yes!",
        // cancelButtonText: "No!",
        closeOnConfirm: true,
        closeOnCancel: true,
        closeOnConfirm: false,
    }, function (isConfirm) {
        if (isConfirm) {
            var payload = {
                Id : id
            }

            viewModel.ajaxPostCallbackNew('/mapping/delete', payload, function (data) {
                swal({
                    title: 'Success',
                    text: 'Data successfully deleted',
                    type: 'success',
                    timer: 2000,
                    showConfirmButton: false
                })

                $("#modal-insert").modal("hide")
                master.refreshMasterData();
            });
        }
    });
}

// Delete END

master.isDpr = ko.observable("No")
master.isDprBool = ko.observable(false)
master.selected.IsDprAsSource.subscribe(function(o) {
    master.IsDprSubs(o)
    master.selected.MapChangeNote("")
})

master.IsDprSubs = function(o) {
    if (!o) {
        master.isDpr("No")
    } else {
        master.isDpr("Yes")
    }

    var srdb = $("#sourceObjectSystemName").data("kendoDropDownList")
    if (!o) {
        $("#sourceObjectSystemName").prop("required" , true)
    } else {
        $("#sourceObjectSystemName").removeAttr("required")
    }
    
    srdb.enable(!o)

    srdb = $("#sourceObjectCountryName").data("kendoDropDownList")
    if (!o) {
        $("#sourceObjectCountryName").prop("required" , true)
    } else {
        $("#sourceObjectCountryName").removeAttr("required")
    }
    srdb.enable(!o)

    srdb = $("#sourceObjectDBName").data("kendoDropDownList")
    if (!o) {
        $("#sourceObjectDBName").prop("required" , true)
    } else {
        $("#sourceObjectDBName").removeAttr("required")
    }
    srdb.enable(!o)

    srdb = $("#sourceObject").data("kendoDropDownList")
    if (!o) {
        $("#sourceObject").prop("required" , true)
    } else {
        $("#sourceObject").removeAttr("required")
    }
    srdb.enable(!o)

    srdb = $("#sourceStructure").data("kendoDropDownList")
    if (!o) {
        $("#sourceStructure").prop("required" , true)
    } else {
        $("#sourceStructure").removeAttr("required")
    }
    srdb.enable(!o)
    
    master.selected.SourceSystemId("")
    
    master.SystemSelected("dpr_drop" , "x")
}

// Sources Data Source

master.whereSystemSelected = ko.observable("s")

// SUBSCRIBE START

// Source SUBSCRIBE START
master.selected.SourceDBId.subscribe(function(o){
    // master.SourceDBIdSubs(o)
})

master.selected.SourceSystemId.subscribe(function(o) {
    // master.SystemSelected("sourceObjectCountryName" , "s")
    // master.selected.SourceCountryId("")
})

master.selected.SourceCountryId.subscribe(function(o) {
    // master.SystemSelected("sourceObjectDBName" , "s")
    // master.selected.SourceCountryId()
})

// Source SUBSCRIBE END

// Source TARGET START
master.selected.TargetDBId.subscribe(function(o) {
    // master.targetDBIdSubs(o)
})

master.selected.TargetSystemId.subscribe(function(o) {
    // master.SystemSelected("targetObjectCountryName" , "t")
})

master.selected.TargetCountryId.subscribe(function(o) {
    // master.SystemSelected("targetObjectDBName" , "t")
})

// Source TARGET END

// SUBSCRIBE END

master.targetDBIdSubs = function(o) {
    $("#targetObject").data("kendoDropDownList").dataSource.read()
}

master.SourceDBIdSubs = function(o) {
    objid = $("#sourceObjectDBName").data("kendoDropDownList")

    master.setLabelTier()

    $("#sourceObject").data("kendoDropDownList").dataSource.read()
    $("#targetObjectDBName").data("kendoDropDownList").dataSource.read()
    $("#targetObject").data("kendoDropDownList").dataSource.read()

    master.dataSourceStructure([])
    master.initAutocompleteSourceStructure("sourceStructure" ,  master.dataSourceStructure() , "s")
}

master.dpr = function() {
    return  {
        sysname : "",
        ctrname : "",
        dbname : "",
        objname : "",
        attrname : "",
    }
}
master.dprSelected = ko.mapping.fromJS(master.dpr());

master.selected.DataProcessingRuleId.subscribe(function(o) {
    master.DPRSubs(o)
})

master.DPRSubs = function(o) {
    ko.mapping.fromJS(master.dpr(), master.dprSelected);
    if (master.selected.IsDprAsSource()) {
        // data = $("#dpr_drop").data("kendoDropDownList").dataItem()
        // var Dpr = "";
        // if (data != null) {
        //     $.each(data.Sources, function(r , o) {
        //         // Tier 2 > Tier 1
        //         // Tier 1 || ""
        //         if (Dpr == "" || Dpr != "Tier 1") {
        //             Dpr = o.SourceLogicalAppLayerName
        //         }
        //     })
        // }
        
        // logical = $("#SourceLogicalLayerName").data("kendoDropDownList")
        // logical.value(Dpr)
        // logical.trigger("change")
    }

    item = $("#dpr_drop").data("kendoDropDownList").dataItem()
    if (master.selected.IsDprAsSource() && item != null) {
        master.selected.Sources(item.Sources);

        $.each(item.Sources , function(r , o) {
            if (master.dprSelected.sysname().indexOf(o.SourceSystemName) == -1) {
                master.dprSelected.sysname(
                    master.dprSelected.sysname()+
                    (master.dprSelected.sysname().length == 0 ? "" : ",") + o.SourceSystemName
                )
            }
            
            if (master.dprSelected.ctrname().indexOf(o.SourceCountryName) == -1) {
                master.dprSelected.ctrname(
                    master.dprSelected.ctrname()+
                    (master.dprSelected.ctrname().length == 0 ? "" : ",") + o.SourceCountryName
                )
            }
            
            if (master.dprSelected.dbname().indexOf(o.SourceDBName) == -1) {
                master.dprSelected.dbname(
                    master.dprSelected.dbname()+
                    (master.dprSelected.dbname().length == 0 ? "" : ",") + o.SourceDBName
                )
            }
            
            if (master.dprSelected.objname().indexOf(o.SourceObjectPhysicalName) == -1) {
                master.dprSelected.objname(
                    master.dprSelected.objname()+
                    (master.dprSelected.objname().length == 0 ? "" : ",") + o.SourceObjectPhysicalName
                )
            }
            
            if (master.dprSelected.attrname().indexOf(o.SourceAttrPhysicalName) == -1) {
                master.dprSelected.attrname(
                    master.dprSelected.attrname()+
                    (master.dprSelected.attrname().length == 0 ? "" : ", \n") + o.SourceAttrPhysicalName
                )
            }

        })

        master.setLabelTier()

        master.SystemSelected("targetObjectDBName" , "t")
        master.SystemSelected("targetObject" , "x")
    }

    if (item != null) {
        master.selected.DataProcessingRuleName(item.DataProcessingRuleName)
    }

}

master.setLabelTier = function() {
}

master.SystemSelected = function(name , type , kendoType) {
    kendoType = (kendoType == undefined ? "kendoDropDownList" : kendoType)
    master.whereSystemSelected(type)
    dropdown = $("#" + name).data(kendoType)
    dropdown.dataSource.read() // Read Country
    // dropdown.refresh() // Read Country
}

// Data Source > Source START

// Source > DB Name
master.dsSourceDBName = new kendo.data.DataSource({
    serverFiltering: true,
    transport: {
        read: function(opt) {
            var payload = {
                AdditionalFilter : {
                    // "logicalapplayername" : [{
                    //     Type : "eq" ,
                    //     value : master.selected.SourceLogicalLayer()
                    // }],
                },
                SkipAddEmptyData : true
            };

            payload.FieldReqs = {
                "Id" : "applayerid" ,
                "DBCode" : "applayercd" ,
                "DBName" : "dbname" ,
                "LOGL_APP_LYR_NM" : "logicalapplayername" ,
            }
            if (master.selected.SourceLogicalLayer() != "") {
                payload.AdditionalFilter["logicalapplayername"] = [
                    {
                        Type: "eq",
                        Value: master.selected.SourceLogicalLayer()
                    }
                ]
            }
            payload.SortField = "_id.DBName"
            payload.SortType = "1"

            if (master.isSetDataFinish()) {
                payload.AdditionalFilter["IsActive"] = [
                    {
                        Type: "eq",
                        Value: "true"
                    }
                ]
                payload.AdditionalFilter["Status"] = [
                    {
                        Type: "eq",
                        Value: STATUS_APPROVED.toString()
                    }
                ]
            }
            
            if(opt.data.filter) {
                _.each(opt.data.filter.filters, function(f) {
                    if (f.value != "") {
                        var field = f.field;
                        payload.AdditionalFilter[field.substr(field.indexOf(".") + 1)] = [{
                            Type: f.operator,
                            Value: f.value
                        }]
                    }
                })
            }

            viewModel.ajaxPost('/objectdefinition/getobjectfiltervalue',payload,function(data){
                // master.selected.SourceDBId("")
                opt.success({data : data.Data , total : data.Total});
            });
        }
    },
    change: function(e) {
        // id = master.selected.SourceDBId()
        // master.selected.SourceDBId("")
        // master.selected.SourceDBId(id)
    },
    schema: {
        data: "data",
        total: "total",
    }
});

// Source > System
master.dsSystemNameSource = new kendo.data.DataSource(
    {
        transport : {
            read : function(opt) {
                var payload = {
                    AdditionalFilter : {
                        // "applayerid" : [
                        //     {
                        //         type : "eq",
                        //         value : master.selected.SourceDBId()
                        //     }
                        // ],
                        
                        // "logicalapplayername" : [{
                        //     Type : "eq" ,
                        //     value : master.selected.SourceLogicalLayer()
                        // }],
                    },
                    SkipAddEmptyData : true
                };
                if(opt.data.filter) {
                    _.each(opt.data.filter.filters, function(f) {
                        var field = f.field;
                        payload.AdditionalFilter[field.substr(field.indexOf(".") + 1)] = [{
                            Type: f.operator,
                            Value: f.value
                        }]
                    })
                }
                if (master.selected.SourceLogicalLayer() != "") {
                    payload.AdditionalFilter["logicalapplayername"] = [{
                        Type: "eq",
                        Value: master.selected.SourceLogicalLayer()
                    }]
                }

                if (master.selected.SourceDBId() != "") {
                    payload.AdditionalFilter["applayerid"] = [{
                        Type: "eq",
                        Value: master.selected.SourceDBId()
                    }]
                }
                
                payload.FieldReqs = {
                    "SourceSystemId" : "sourcesystemid" ,
                    "SourceSystemCd" : "sourcesystemcd" ,
                    "SourceSystemName" : "sourcesystemname" ,
                }
                payload.SortField = "_id.SourceSystemName"
                payload.SortType = "1"
            
                if (master.isSetDataFinish()) {
                    payload.AdditionalFilter["IsActive"] = [
                        {
                            Type: "eq",
                            Value: "true"
                        }
                    ]
                    payload.AdditionalFilter["Status"] = [
                        {
                            Type: "eq",
                            Value: STATUS_APPROVED.toString()
                        }
                    ]
                }
    
                viewModel.ajaxPost('/objectdefinition/getobjectfiltervalue',payload,function(data){
                    opt.success({data : data.Data , total : data.Total});
                });
            }       
        },
        schema: {
            data: 'data',
            total: 'total',
        },
        pageSize: 10,
        serverPaging: true,
        serverSorting: true,
        serverFiltering: true,
    }
);

// Source > Country
master.dsSourceCountryName = new kendo.data.DataSource(
    {
        transport : {
            read : function(opt) {

                var payload = {
                    FieldReqs : {
                    } ,
                    AdditionalFilter : {
                        // "applayerid" : [
                        //     {
                        //         type : "eq",
                        //         value : master.selected.SourceDBId()
                        //     }
                        // ],
                        // "sourcesystemid" : [{
                        //     Type : "eq" ,
                        //     value : master.selected.SourceSystemId()
                        // }],
                        // "logicalapplayername" : [{
                        //     Type : "eq" ,
                        //     value : master.selected.SourceLogicalLayer()
                        // }],
                    },
                    SkipAddEmptyData : true
                }

                if(opt.data.filter) {
                    _.each(opt.data.filter.filters, function(f) {
                        var field = f.field;
                        if (field.substr(field.indexOf(".") + 1) == "name") {
                            payload.AdditionalFilter["countryname"] = [{
                                Type: f.operator,
                                Value: f.value
                            }]

                        }
                    })
                }

                if (master.selected.SourceLogicalLayer() != "") {
                    payload.AdditionalFilter["logicalapplayername"] = [{
                        Type: "eq",
                        Value: master.selected.SourceLogicalLayer()
                    }]
                }

                if (master.selected.SourceDBId() != "") {
                    payload.AdditionalFilter["applayerid"] = [{
                        Type: "eq",
                        Value: master.selected.SourceDBId()
                    }]
                }

                if (master.selected.SourceSystemId() != "") {
                    payload.AdditionalFilter["sourcesystemid"] = [{
                        Type: "eq",
                        Value: master.selected.SourceSystemId()
                    }]
                }

                payload.FieldReqs = {
                    "id" : "countryid" ,
                    "code" : "countrycd" ,
                    "name" : "countryname" ,
                }
                payload.SortField = "_id.name"
                payload.SortType = "1"
            
                if (master.isSetDataFinish()) {
                    payload.AdditionalFilter["IsActive"] = [
                        {
                            Type: "eq",
                            Value: "true"
                        }
                    ]
                    payload.AdditionalFilter["Status"] = [
                        {
                            Type: "eq",
                            Value: STATUS_APPROVED.toString()
                        }
                    ]
                }

                viewModel.ajaxPost('/objectdefinition/getobjectfiltervalue',payload,function(data){
                    opt.success({data : data.Data , total : data.Total});
                });
            }       
        },
        schema: {
            data: 'data',
            total: 'total',
        },
        pageSize: 10,
        serverPaging: true,
        serverSorting: true,
        serverFiltering: true,
    }
);

// Source > Object Definition
master.dsSource = new kendo.data.DataSource({
    serverFiltering: true,
    transport: {
        read: function(opt) {
            var payload = ko.mapping.toJS(master.filterObjectDef);
            payload.PerPage = 0
            payload.AdditionalFilter = {
                // "sourcesystemid" : [{
                //     Type : "eq" ,
                //     value : master.selected.SourceSystemId()
                // }],
            };
            if(opt.data.filter) {
                _.each(opt.data.filter.filters, function(f) {
                    var field = f.field;
                    if (field.substr(field.indexOf(".") + 1) == "PhysicalName") {
                        payload.AdditionalFilter["LogicalName"] = [{
                            Type: f.operator,
                            Value: f.value
                        }]
                        payload.AdditionalFilter["PhysicalName"] = [{
                            Type: f.operator,
                            Value: f.value
                        }]
                    }
                })
            }

            if (master.selected.SourceLogicalLayer() != "") {
                payload.AdditionalFilter["logicalapplayername"] = [{
                    Type: "eq",
                    Value: master.selected.SourceLogicalLayer()
                }]
            }

            if (master.selected.SourceDBId() != "") {
                payload.AdditionalFilter["applayerid"] = [{
                    Type : "eq" ,
                    value : master.selected.SourceDBId()
                }]
            }

            if (master.selected.SourceSystemId() != "") {
                payload.AdditionalFilter["sourcesystemid"] = [{
                    Type: "eq",
                    Value: master.selected.SourceSystemId()
                }]
            }

            if (master.selected.SourceCountryId() != "") {
                payload.AdditionalFilter["CountryId"] = [{
                    Type : "eq" ,
                    value : master.selected.SourceCountryId()
                }]
            }
            payload.SortField = "PhysicalName".toLowerCase()
            payload.SortType = "1"
            
            if (master.isSetDataFinish()) {
                payload.AdditionalFilter["IsActive"] = [
                    {
                        Type: "eq",
                        Value: "true"
                    }
                ]
                payload.AdditionalFilter["Status"] = [
                    {
                        Type: "eq",
                        Value: STATUS_APPROVED.toString()
                    }
                ]
            }

            // viewModel.ajaxPost("/objectdefinition/getobjectsource", payload, function(res) {
            viewModel.ajaxPost("/objectdefinition/get", payload, function(res) {
                // change physical name to mapping
                // check if use dpr or not
                datas = res.Data
                if (!master.selected.IsDprAsSource()) {
                    $.each(datas , function(r , o){
                        if (master.selected.SourceObjectId() == o.Id) {
                            source = ko.mapping.toJS(master.selected.Sources())
                            o.PhysicalName = source[0].SourceObjectPhysicalName
                        }
                    })
                }
                master.dataSourceObject(datas)

                opt.success({data: res.Data, total: res.Total});
            })
        }
    },
    schema: {
        data: "data",
        total: "total",
    }
});

// Data Source > Source END

// Data Source > Target START

// Target > DB Name
master.dsTargetDBName = new kendo.data.DataSource({
    serverFiltering: true,
    transport: {
        read: function(opt) {
            var payload = ko.mapping.toJS(master.filterObjectDef);
            payload.SkipAddEmptyData = true
            payload.AdditionalFilter = {
                "logicalapplayername" : [
                    {
                        Type : "eq" ,
                        value : master.selected.TargetLogicalAppLayerName()
                    }
                ],
            };

            if(opt.data.filter) {
                _.each(opt.data.filter.filters, function(f) {
                    var field = f.field;
                    payload.AdditionalFilter[field.substr(field.indexOf(".") + 1)] = [{
                        Type: f.operator,
                        Value: f.value
                    }]
                })
            }

            payload.FieldReqs = {
                "Id" : "applayerid" ,
                "DBCode" : "applayercd" ,
                "DBName" : "dbname" ,
                "LOGL_APP_LYR_NM" : "logicalapplayername" ,
            }
            payload.SortField = "_id.DBName"
            payload.SortType = "1"
            
            if (master.isSetDataFinish()) {
                payload.AdditionalFilter["IsActive"] = [
                    {
                        Type: "eq",
                        Value: "true"
                    }
                ]
                payload.AdditionalFilter["Status"] = [
                    {
                        Type: "eq",
                        Value: STATUS_APPROVED.toString()
                    }
                ]
            }

            viewModel.ajaxPost("/objectdefinition/getobjectfiltervalue", payload, function(res) {
                // master.dataSourceObject(res.Data)

                opt.success({data: res.Data, total: res.Total});
            })
        }
    },
    schema: {
        data: "data",
        total: "total",
    }
});

// Target > System
master.dsSystemNameSourceTarget = new kendo.data.DataSource(
    {
        transport : {
            read : function(opt) {
                var payload = {
                    AdditionalFilter : {
                        // "applayerid" : [
                        //     {
                        //         type : "eq",
                        //         value : master.selected.TargetDBId()
                        //     }
                        // ],
                        
                        // "logicalapplayername" : [{
                        //     Type : "eq" ,
                        //     value : master.selected.TargetLogicalAppLayerName()
                        // }],
                    },
                    SkipAddEmptyData : true
                };
                if(opt.data.filter) {
                    _.each(opt.data.filter.filters, function(f) {
                        var field = f.field;
                        payload.AdditionalFilter[field.substr(field.indexOf(".") + 1)] = [{
                            Type: f.operator,
                            Value: f.value
                        }]
                    })
                }

                if (master.selected.TargetLogicalAppLayerName() != "") {
                    payload.AdditionalFilter["logicalapplayername"] = [
                        {
                            Type: "eq",
                            Value: master.selected.TargetLogicalAppLayerName()
                        }
                    ]
                }

                if (master.selected.TargetDBId() != "") {
                    payload.AdditionalFilter["applayerid"] = [
                        {
                            Type: "eq",
                            Value: master.selected.TargetDBId()
                        }
                    ]
                }
                
                payload.FieldReqs = {
                    "SourceSystemId" : "sourcesystemid" ,
                    "SourceSystemCd" : "sourcesystemcd" ,
                    "SourceSystemName" : "sourcesystemname" ,
                }
                payload.SortField = "_id.SourceSystemName"
                payload.SortType = "1"
            
                if (master.isSetDataFinish()) {
                    payload.AdditionalFilter["IsActive"] = [
                        {
                            Type: "eq",
                            Value: "true"
                        }
                    ]
                    payload.AdditionalFilter["Status"] = [
                        {
                            Type: "eq",
                            Value: STATUS_APPROVED.toString()
                        }
                    ]
                }
    
                viewModel.ajaxPost('/objectdefinition/getobjectfiltervalue',payload,function(data){
                    opt.success({data : data.Data , total : data.Total});
                });
            }     
        },
        schema: {
            data: 'data',
            total: 'total',
        },
        pageSize: 10,
        serverPaging: true,
        serverSorting: true,
        serverFiltering: true,
    }
);

// Target > Country
master.dsTargetCountryName = new kendo.data.DataSource(
    {
        transport : {
            read : function(opt) {
                var system = master.selected.TargetSystemId()

                var payload = {
                    FieldReqs : {
                    } ,
                    AdditionalFilter : {
                        // "SourceSystemId" : [{
                        //     Type : "eq" ,
                        //     value : system
                        // }] ,
                        // "LogicalAppLayerName" : [{
                        //     Type : "eq" ,
                        //     value : master.selected.TargetLogicalLayer()
                        // }]
                    },
                    SkipAddEmptyData : true
                }

                if(opt.data.filter) {
                    _.each(opt.data.filter.filters, function(f) {
                        var field = f.field;
                        payload.AdditionalFilter[field.substr(field.indexOf(".") + 1)] = [{
                            Type: f.operator,
                            Value: f.value
                        }]
                    })
                }

                if (master.selected.TargetLogicalAppLayerName() != "") {
                    payload.AdditionalFilter["logicalapplayername"] = [
                        {
                            Type: "eq",
                            Value: master.selected.TargetLogicalAppLayerName()
                        }
                    ]
                }
            
                if (master.selected.TargetDBId() != "") {
                    payload.AdditionalFilter["applayerid"] = [
                        {
                            Type: "eq",
                            Value: master.selected.TargetDBId()
                        }
                    ]
                }

                if (master.selected.TargetSystemId() != "") {
                    payload.AdditionalFilter["SourceSystemId"] = [
                        {
                            Type: "eq",
                            Value: master.selected.TargetSystemId()
                        }
                    ]
                }

                payload.FieldReqs = {
                    "id" : "countryid" ,
                    "code" : "countrycd" ,
                    "name" : "countryname" ,
                }
                payload.SortField = "_id.name"
                payload.SortType = "1"
            
                if (master.isSetDataFinish()) {
                    payload.AdditionalFilter["IsActive"] = [
                        {
                            Type: "eq",
                            Value: "true"
                        }
                    ]
                    payload.AdditionalFilter["Status"] = [
                        {
                            Type: "eq",
                            Value: STATUS_APPROVED.toString()
                        }
                    ]
                }

                viewModel.ajaxPost('/objectdefinition/getobjectfiltervalue',payload,function(data){
                    opt.success({data : data.Data , total : data.Total});
                });
            }       
        },
        schema: {
            data: 'data',
            total: 'total',
        },
        pageSize: 10,
        serverPaging: true,
        serverSorting: true,
        serverFiltering: true,
    }
);

// Target > Object Def
master.dsTargetObj = new kendo.data.DataSource({
    serverFiltering: true,
    transport: {
        read: function(opt) {
            var payload = ko.mapping.toJS(master.filterObjectDef);
            payload.PerPage = 0
        
            payload.AdditionalFilter = {};
            payload.SourceTier = master.selected.SourceLogicalLayer()
            // payload.SourceTier = (ar_tier[1] > 0 ? "Tier 2" : "Tier 1")
            // payload.SourceTier = (ar_tier[1] > 0 ? "Tier 2" : "Tier 1")

            if(opt.data.filter) {
                _.each(opt.data.filter.filters, function(f) {
                    var field = f.field;
                    if (field.substr(field.indexOf(".") + 1) == "PhysicalName") {
                        payload.AdditionalFilter["LogicalName"] = [
                            {
                                Type: f.operator,
                                Value: f.value
                            }
                        ]
                        payload.AdditionalFilter["PhysicalName"] = [
                            {
                                Type: f.operator,
                                Value: f.value
                            }
                        ]
                    }
                })
            }

            if (master.selected.TargetLogicalAppLayerName() != "") {
                payload.AdditionalFilter["logicalapplayername"] = [
                    {
                        Type: "eq",
                        Value: master.selected.TargetLogicalAppLayerName()
                    }
                ]
            }
            
            if (master.selected.TargetDBId() != "") {
                payload.AdditionalFilter["applayerid"] = [
                    {
                        Type: "eq",
                        Value: master.selected.TargetDBId()
                    }
                ]
            }

            if (master.selected.TargetSystemId() != "") {
                payload.AdditionalFilter["SourceSystemId"] = [
                    {
                        Type: "eq",
                        Value: master.selected.TargetSystemId()
                    }
                ]
            }
            
            if (master.selected.TargetCountryId() != "") {
                payload.AdditionalFilter["CountryId"] = [
                    {
                        Type : "eq" ,
                        value : master.selected.TargetCountryId()
                    }
                ]
            }
				
            payload.SortField = "PhysicalName".toLowerCase()
            payload.SortType = "1"
            
            if (master.isSetDataFinish()) {
                payload.AdditionalFilter["IsActive"] = [
                    {
                        Type: "eq",
                        Value: "true"
                    }
                ]
                payload.AdditionalFilter["Status"] = [
                    {
                        Type: "eq",
                        Value: STATUS_APPROVED.toString()
                    }
                ]
            }

            // viewModel.ajaxPost('/objectdefinition/getobjecttarget', payload, function(res) {
            viewModel.ajaxPost('/objectdefinition/get', payload, function(res) {
                // master.dataSourceObject(res.Data)
                datas = res.Data
                if (!master.selected.IsDprAsSource()) {
                    $.each(datas , function(r , o){
                        if (master.selected.TargetObjectId() == o.Id) {
                            o.PhysicalName = master.selected.TargetObjectPhysicalName()
                        }
                    })
                }
                master.isSetDataFinish(true)

                opt.success({data: datas, total: res.Total});
            })
        }
    },
    schema: {
        data: "data",
        total: "total",
    }
})

// Data Source > Target END

master.dsDpr = new kendo.data.DataSource(
    {
        transport : {
            read : function(opt) {
                var payload = {
                    FieldReqs : {
                    } ,
                    AdditionalFilter : {
                        "IsSourceAvailable" : [{
                            Type : "eq" ,
                            value : master.selected.IsDprAsSource() + ""
                        }]
                    }
                }
                payload.SortField = "DataProcessingRuleName".toLowerCase()
                payload.SortType = "1"
                
                if (master.isSetDataFinish()) {
                    payload.AdditionalFilter["IsActive"] = [
                        {
                            Type: "eq",
                            Value: "true"
                        }
                    ]
                    payload.AdditionalFilter["Status"] = [
                        {
                            Type: "eq",
                            Value: STATUS_APPROVED.toString()
                        }
                    ]
                }

                viewModel.ajaxPost("/dataprocessingrule/get", payload, function (data) {
                    // Check name make sure same as mapping grid
                    datas = data.Data
                    $.each(datas , function(r , o){
                        if (master.selected.DataProcessingRuleId() == o.Id) {
                            o.DataProcessingRuleName = master.selected.DataProcessingRuleName()
                        }
                    })

                    opt.success({data : data.Data , total : data.Total});
                })
            }       
        },
        schema: {
            data: 'data',
            total: 'total',
        },
        pageSize: 10,
        serverPaging: true,
        serverSorting: true,
        serverFiltering: true,
    }
);

// Sources START

master.BoundSrcObj = function(o) {
    if (master.selected.ModeUpdate() == "update") {
        db = $("#sourceObject").data("kendoDropDownList")
        db.value(master.selected.SourceObjectId())
        struct = []
        if (db.dataItem() != null) {
            struct = db.dataItem().Structures
            if (!master.selected.IsDprAsSource()) {
                $.each(struct , function(r , o){
                    if (master.selected.SourceAttrId() == o.Id) {
                        source = ko.mapping.toJS(master.selected.Sources())
                        o.PhysicalName = source[0].SourceAttrPhysicalName
                    }
                })
            }
        }
        
        master.SourceObjectSelect(
            {
                dataItem : {
                    Structures : struct
                } ,
                sender : o.sender
            }
        )
    
        db = $("#sourceStructure").data("kendoDropDownList")
        db.value(master.selected.SourceAttrId())
    }
}
// Sources END

// Target Start

master.BoundTgtDBName = function(o) {
    // if (master.selected.ModeUpdate() == "update") {
    //     db = $("#targetObjectDBName").data("kendoDropDownList")
    //     db.value(master.selected.TargetDBId())
    // }

    // master.targetDBIdSubs(o);
}

master.BoundTgtObj = function(o) {
    // master.isSetDataFinish(true)
    master.selected.TargetObjectId(master.selected.TargetObjectId())

    db = $("#targetObject").data("kendoDropDownList")
    dataItem = $.grep(db.dataSource.view() , function(o) {
        return o.Id == master.selected.TargetObjectId()
    })
    db.value(master.selected.TargetObjectId())


    // master.targetObjSelect(
    //     {
    //         dataItem : db.dataItem(),
    //         sender : o.sender
    //     }
    // )
    if (dataItem.length > 0) {
        datas = dataItem[0].Structures
        if (!master.selected.IsDprAsSource()) {
            $.each(datas , function(r , o){
                if (master.selected.TargetAttrId() == o.Id) {
                    o.PhysicalName = master.selected.TargetAttrPhysicalName()
                }
            })
        }

        master.dataTargetStructure(datas)
        master.initAutocompleteStructure("targetStructure" ,  master.dataTargetStructure() , "t")
    }

    db = $("#targetStructure").data("kendoDropDownList")
    db.value(master.selected.TargetAttrId())
}

// Target END

master.BoundDPR = function(o) {
    db = $("#dpr_drop").data("kendoDropDownList")
    db.value(master.selected.DataProcessingRuleId())
    master.DPRSubs(master.selected.DataProcessingRuleId());

    dataItem = db.dataItem()
    if (dataItem != null) {
        master.selected.MapChangeNote(dataItem.MapNote)
    }
}

// master.optionsOpen
master.optionsOpen = function(opt) {
    $('#modal-options').modal({
        show: true,
        backdrop: 'static',
        keyboard: false, // prevent esc
    })

    // Reset the css from drag position
    $("#modal-options > .modal-dialog").css("left", "0").css("top", "0");
}

// 
master.dsMappingGroup = new kendo.data.DataSource(
    {
        transport : {
            read : function(opt) {
                var srcSys = $("#sourceObjectSystemName").data("kendoDropDownList")
                var srcSysData = srcSys.dataItem()
                if (srcSysData != null) {
                    srcSysData = srcSysData.SourceSystemName
                } else if (srcSys.dataSource.data().length > 0) {
                    srcSysData = srcSys.dataSource.data()[0].SourceSystemName
                }

                var srcObj = $("#sourceObject").data("kendoDropDownList")
                var srcObjData = srcObj.dataItem()
                if (srcObjData != null) {
                    srcObjData = srcObjData.PhysicalName
                } else if (srcObj.dataSource.data().length > 0) {
                    srcObjData = srcObj.dataSource.data()[0].PhysicalName
                }

                var tgtObj = $("#targetObject").data("kendoDropDownList")
                var tgtObjData = tgtObj.dataItem()
                if (tgtObjData != null) {
                    tgtObjData = tgtObjData.PhysicalName
                } else if (tgtObj.dataSource.data().length > 0) {
                    tgtObjData = tgtObj.dataSource.data()[0].PhysicalName
                }

                var dpr = $("#dpr_drop").data("kendoDropDownList").dataItem()
                // dprname = dpr.DataProcessingRuleName
                dprname = ""
                if (master.selected.IsDprAsSource() && dpr != null &&  dpr.Sources[0] != undefined) {
                    srcSysData = dpr.Sources[0].SourceSystemName
                    srcObjData = dpr.Sources[0].SourceObjectPhysicalName
                }

                var payload = {
                    FieldReqs : {
                    } ,
                    AdditionalFilter : {
                    },
                    DPRName : dprname, // string
                    UseDPR : master.selected.IsDprAsSource(), // bool
                    SourceSystemPhysicalName : srcSysData, // string
                    SourceObjectPhysicalName : srcObjData, // string
                    TargetObjectPhysicalName : tgtObjData, // string
                }
                if (opt.data.filter) {
                    _.each(opt.data.filter.filters, function (f) {
                        var field = f.field;
                        payload.AdditionalFilter[field.substr(field.indexOf(".") + 1)] = [{
                            Type: f.operator,
                            Value: f.value
                        }]
                    })
                }
                payload.SortField = "Name".toLowerCase()
                payload.SortType = "1"
                
                viewModel.ajaxPost("/datamaster/maplookup", payload, function (data) {
                    dataMapGroup = data.Data
                    // check result 
                    // data.Data
                    currentMapping = ko.mapping.toJS(master.selected.Mappings());
                    // if (currentMapping.length > 0)
                    if (currentMapping.length > 0) {
                        r = currentMapping[currentMapping.length - 1]
                        datax = dataMapGroup.find(function (d) { 
                            return d.Id == r.MappingGroupId 
                        })
                        if (datax == undefined) { // Kalo Tidak ada
                            dataMapGroup.push({
                                Id : r.MappingGroupId,
                                Name : r.MappingGroupName,
                                Value : r.MappingGroupCode,
                            })
                        }
                    }
                    
                    opt.success({data : dataMapGroup , total : data.Total});
                })
            }       
        },
        schema: {
            data: 'data',
            total: 'total',
        },
        pageSize: 10,
        serverPaging: true,
        serverSorting: true,
        serverFiltering: true,
    }
);

master.selected.NewMappingGroup.subscribe(function(o) {
    if (o) {
        $("#FRM_MapGroup").removeAttr("required")
    } else {
        $("#FRM_MapGroup").attr("required" , "required")
    }
})

master.IsSelectedProduction.subscribe(function(o) {
    master.IsSelectedProductionText(o ? "Yes" : "No")
})

master.map_project_all = function(isChecked , IdListBox){
    sel = ko.mapping.toJS(master.selectedMasterProjectMapping)
    project = $("#" + IdListBox).data("kendoListBox")
    addId = ""
    if (IdListBox == "mapping_mapping") {
        addId = "MP_"
    }
    
    $.each(project.dataSource.view() , function(r , dataItem){
        $("#" + addId + dataItem.Id).prop("checked" , isChecked)
        
        ar_ind = sel.ProjectId.indexOf(dataItem.Id);

        if (isChecked) {
            if (ar_ind == -1) {
                if (IdListBox == "projects_mapping") {
                    row = master.newProject()
                
                    row.ProjectId   = dataItem.Id +""
                    row.ProjectCode = dataItem.Value
                    row.ProjectName = dataItem.Name
    
                    sel.Projects.push(row)
                    sel.ProjectId.push(dataItem.Id)
                } else if (IdListBox == "mapping_mapping") {
                    sel.Mappings.push(dataItem)
                    sel.MappingId.push(dataItem.Id)
                }
    
                $("#"  + addId + dataItem.Id).parent().parent().addClass('k-state-selected')
            }
        } else {
            if (IdListBox == "projects_mapping") {
                sel.Projects.splice(ar_ind , 1)
                sel.ProjectId.splice(ar_ind , 1)
            } else if (IdListBox == "mapping_mapping") {
                sel.Mappings.splice(ar_ind , 1)
                sel.MappingId.splice(ar_ind , 1)
            }

            $("#"  + addId + dataItem.Id).parent().parent().removeClass('k-state-selected')
        }
    })

    if (IdListBox == "projects_mapping") {
        master.selectedMasterProjectMapping.Projects(sel.Projects)
        master.selectedMasterProjectMapping.ProjectId(sel.ProjectId)
    } else if (IdListBox == "mapping_mapping") {
        master.selectedMasterProjectMapping.Mappings(sel.Mappings)
        master.selectedMasterProjectMapping.MappingId(sel.MappingId)
    }
}

// Data Bound START

master.dsFilterSrcObjName = new kendo.data.DataSource(
    {
        transport : {
            read: function(opt) {
                var payload = ko.mapping.toJS(master.filterObjectDef);
                payload.AdditionalFilter = {};

                logical = $("#MP_SourceLogicalLayerName").data("kendoDropDownList").value()
                system = $("#MP_SourceSystemName").data("kendoDropDownList").value()
    
                if (logical != "") {
                    payload.AdditionalFilter["logicalapplayername"] = [{
                        Type: "eq",
                        Value: logical
                    }]
                }

                if (system != "") {
                    payload.AdditionalFilter["sourcesystemid"] = [{
                        Type: "eq",
                        Value: system
                    }]
                }
                if(opt.data.filter) {
                    _.each(opt.data.filter.filters, function(f) {
                        var field = f.field;
                        payload.AdditionalFilter[field.substr(field.indexOf(".") + 1)] = [{
                            Type: f.operator,
                            Value: f.value
                        }]
                    })
                }
    
                viewModel.ajaxPost("/objectdefinition/get", payload, function(res) {
                    opt.success({data: res.Data, total: res.Total});
                })
            }
        },
        schema: {
            data: 'data',
            total: 'total',
        },
        pageSize: 10,
        serverPaging: true,
        serverSorting: true,
        serverFiltering: true,
    }
);
master.dsFilterTgtObjName = new kendo.data.DataSource(
    {
        transport : {
            read: function(opt) {
                var payload = ko.mapping.toJS(master.filterObjectDef);
                payload.AdditionalFilter = {};

                logical = $("#MP_TargetLogicalLayerName").data("kendoDropDownList").value()
                system = $("#MP_TargetSystemName").data("kendoDropDownList").value()
    
                // payload.SourceTier = "Tier 1"
                if (logical != "") {
                    payload.AdditionalFilter["logicalapplayername"] = [{
                        Type: "eq",
                        Value: logical
                    }]
                }

                if (system != "") {
                    payload.AdditionalFilter["sourcesystemid"] = [{
                        Type: "eq",
                        Value: system
                    }]
                }
                
                if(opt.data.filter) {
                    _.each(opt.data.filter.filters, function(f) {
                        var field = f.field;
                        payload.AdditionalFilter[field.substr(field.indexOf(".") + 1)] = [{
                            Type: f.operator,
                            Value: f.value
                        }]
                    })
                }
    
                viewModel.ajaxPost("/objectdefinition/get", payload, function(res) {
                    opt.success({data: res.Data, total: res.Total});
                })
            }
        },
        schema: {
            data: 'data',
            total: 'total',
        },
        pageSize: 10,
        serverPaging: true,
        serverSorting: true,
        serverFiltering: true,
    }
);

// Data Bound END

// OPTIONS START
master.DeleteSelected = function(o) {
    // Checker can't access this method
    if (master.gridChecked().length == 0 || viewModel.role() == 'Checker') {
        return
    }

    swal({
        title: 'Are you sure want to delete ?',
        text: "This action will be delete "+master.gridChecked().length+" Source to Target Mapping(s)",
        type: 'warning',
        showCancelButton: true,
        // confirmButtonClass: "btn-danger",
        // confirmButtonText: "Yes!",
        // cancelButtonText: "No!",
        closeOnConfirm: false,
        closeOnCancel: true,
    }, function (isConfirm) {
        if (isConfirm) {
            viewModel.isLoading(true)
            var payload = {
                Ids: []
            }
            $.each(master.gridChecked(), function (row, obj) {
                payload.Ids.push(obj)
            })

            viewModel.ajaxPostCallbackNew('/mapping/delete', payload, function (data) {
                master.gridChecked([])
                viewModel.isLoading(false)
                swal({
                    title: 'Success',
                    text: 'Data successfully deleted',
                    type: 'success',
                    timer: 2000,
                    showConfirmButton: false
                })
                master.refreshMasterData();
            });
        }
    });
}

master.ProductionSelected = function(o) {
    swal({
        title: 'Are you sure want to update to '+(master.IsSelectedProduction() ? "Production" : "Not Production")+' ?',
        text: "This action will be update "+master.gridChecked().length+" Source to Target Mapping(s)",
        type: 'warning',
        showCancelButton: true,
        // confirmButtonClass: "btn-danger",
        // confirmButtonText: "Yes!",
        // cancelButtonText: "No!",
        closeOnConfirm: false,
        closeOnCancel: true,
    }, function (isConfirm) {
        if (isConfirm) {
            viewModel.isLoading(true)
            $.each(master.gridChecked() , function(row , obj) {
                var payload = master.dataMasterData().find(function (d) { return d.Id == obj })
                payload.IsProd = master.IsSelectedProduction() + ""

                viewModel.ajaxPostCallbackNew('/mapping/create', payload, function (data) {});
            })
            viewModel.UnSelected(master.gridChecked() , false , true)
            viewModel.isLoading(false)

            swal({
                title: 'Success',
                text: 'Data successfully updated',
                type: 'success',
                timer: 2000,
                showConfirmButton: false
            })

            master.refreshMasterData();
        }
    });
}

master.ExportSelected = function(o) {
    swal({
        title: 'Are you sure want to export ?',
        text: "This action will be export "+master.gridChecked().length+" Source to Target Mapping(s)",
        type: 'warning',
        showCancelButton: true,
        // confirmButtonClass: "btn-danger",
        // confirmButtonText: "Yes!",
        // cancelButtonText: "No!", ExportExcel
        closeOnConfirm: false,
        closeOnCancel: true,
    }, function (isConfirm) {
        if (isConfirm) {
            var payload = {
                Id : master.gridChecked()
            }

            viewModel.isLoading(true)
            viewModel.ajaxPostCallbackNew('/mapping/exportexcel', payload, function (data) {
                swal({
                    title: 'Success',
                    text: 'Data successfully exported',
                    type: 'success',
                    timer: 2000,
                    showConfirmButton: false
                })
                viewModel.UnSelected(master.gridChecked() , false , true)
                viewModel.isLoading(false)
    
                viewModel.DownloadExport(data)
            });
        }
    });
}

master.ApproveSelected = function (IsApproveAction = true) {
    if (master.gridChecked().length == 0 || viewModel.role() == 'Maker') {
        return
    }

    IsApproveAction = (typeof IsApproveAction === 'undefined' ? true : IsApproveAction)
    ApproveText = IsApproveAction ? "Approve" : "Reject";

    swal({
        title: 'Are you sure want to ' + ApproveText + ' ?',
        text: "This action will be " + ApproveText + " " + master.gridChecked().length + " Source to Target(s)",
        type: 'input',
        showCancelButton: true,
        // confirmButtonClass: "btn-danger",
        // confirmButtonText: "Yes!",
        // cancelButtonText: "No!", ExportExcel
        closeOnConfirm: false,
        closeOnCancel: true,
    }, function (inputValue) {
        if (inputValue === "" || inputValue === false) {
            swal("Error!", "Remarks should not be empty", "error")
        } else {
            viewModel.isLoading(true)
            master.ApproveAction(master.gridChecked(), IsApproveAction, true, inputValue, function() {
                viewModel.UnSelected(master.gridChecked() , false , true)
                master.refreshMasterData()
                viewModel.isLoading(false)
            })
        }
    });
}

// OPTIONS END

// Filter START
master.dsFilterAttribute = new kendo.data.DataSource({
    serverFiltering: true,
    transport: {
        read: function(opt) {
            var payload = {
                AdditionalFilter : {
                    // "logicalapplayername" : [{
                    //     Type : "eq" ,
                    //     value : master.selected.SourceLogicalLayer()
                    // }],
                },
                SkipAddEmptyData : true
            };

            if (master.filterDropdown.objphyname() != "") {
                payload.AdditionalFilter["physicalname"] = [
                    {
                        Type: "eq",
                        Value: master.filterDropdown.objphyname()
                    }
                ]
            }
            payload.SortField = "structures.physicalname"
            payload.SortType = "1"
            
            if(opt.data.filter) {
                _.each(opt.data.filter.filters, function(f) {
                    if (f.value != "") {
                        var field = f.field;
                        payload.AdditionalFilter["structuresphysicalname"] = [{
                            Type: f.operator,
                            Value: f.value
                        }]
                    }
                })
            }

            viewModel.ajaxPost('/objectdefinition/getobjectstructurephysicalname',payload,function(data){
                // master.selected.SourceDBId("")
                opt.success({data : data.Data.sort() , total : data.Total});
            });
        }
    },
    schema: {
        data: "data",
        total: "total",
    }
});


master.ApproveAction = function(Ids, IsApproveAction, IsMulti, Remark , callback = function(){}) {
    callback = typeof callback != "function" ? function(){} : callback
    var payload = {
        Id : Ids ,
        IsApproveAction: IsApproveAction,
        IsMulti : IsMulti ,
        Remark : Remark ,
    }

    viewModel.isLoading(true)
    viewModel.ajaxPostCallbackNew('/mapping/approvemultiple', payload, function (data) {
        // TODO data, is approve always success?
        swal({
            title: 'Success',
            text: 'Data successfully approve',
            type: 'success',
            timer: 2000,
            showConfirmButton: false
        })

        callback(data)
    });
}

// Filter END