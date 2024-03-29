/******************************************************************************
 * OpenLP - Open Source Lyrics Projection                                      *
 * --------------------------------------------------------------------------- *
 * Copyright (c) 2008-2017 OpenLP Developers                                   *
 * --------------------------------------------------------------------------- *
 * This program is free software; you can redistribute it and/or modify it     *
 * under the terms of the GNU General Public License as published by the Free  *
 * Software Foundation; version 2 of the License.                              *
 *                                                                             *
 * This program is distributed in the hope that it will be useful, but WITHOUT *
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or       *
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for    *
 * more details.                                                               *
 *                                                                             *
 * You should have received a copy of the GNU General Public License along     *
 * with this program; if not, write to the Free Software Foundation, Inc., 59  *
 * Temple Place, Suite 330, Boston, MA 02111-1307 USA                          *
 ******************************************************************************/

window.OpenLP = {
  getElement: function(event) {
    var targ;
    if (!event) {
      var event = window.event;
    }
    if (event.target) {
      targ = event.target;
    }
    else if (event.srcElement) {
      targ = event.srcElement;
    }
    if (targ.nodeType == 3) {
      // defeat Safari bug
      targ = targ.parentNode;
    }
    var isSecure = false;
    var isAuthorised = false;
    return $(targ);
  },
  getSearchablePlugins: function () {
    $.getJSON(
      "/api/plugin/search",
      function (data, status) {
        var select = $("#search-plugin");
        select.html("");
        $.each(data.results.items, function (idx, value) {
          select.append("<option value='" + value[0] + "'>" + value[1] + "</option>");
        });
        select.selectmenu("refresh");
      }
    );
  },
  loadService: function (event) {
    if (event) {
      event.preventDefault();
    }
    $.getJSON(
      "/api/service/list",
      function (data, status) {
        var ul = $("#service-manager > div[data-role=content] > ul[data-role=listview]");
        ul.html("");
        $.each(data.results.items, function (idx, value) {
          var text = value["title"];
          if (value["notes"]) {
            text += ' - ' + value["notes"];
          }
          var li = $("<li data-icon=\"false\">").append(
            $("<a href=\"#\">").attr("value", parseInt(idx, 10)).text(text));
          li.attr("uuid", value["id"])
          li.children("a").click(OpenLP.setItem);
          ul.append(li);
        });
        ul.listview("refresh");
      }
    );
  },
  loadController: function (event) {
    if (event) {
      event.preventDefault();
    }
    $.getJSON(
      "/api/controller/live/text",
      function (data, status) {
        var ul = $("#slide-controller > div[data-role=content] > ul[data-role=listview]");
        ul.html("");
        for (idx in data.results.slides) {
          var indexInt = parseInt(idx,10);
          var slide = data.results.slides[idx];
          var text = slide["tag"];
          if (text != "") {
            text = text + ": ";
          }
          if (slide["title"]) {
            text += slide["title"]
          } else {
            text += slide["text"];
          }
          if (slide["slide_notes"]) {
            text += ("<div style='font-size:smaller;font-weight:normal'>" + slide["slide_notes"] + "</div>");
          }
          text = text.replace(/\n/g, '<br />');
          if (slide["img"]) {
            text += "<img src='" + slide["img"].replace("/thumbnails/", "/thumbnails88x88/") + "'>";
          }
          var li = $("<li data-icon=\"false\">").append($("<a href=\"#\">").html(text));
          if (slide["selected"]) {
            li.attr("data-theme", "e");
          }
          li.children("a").click(OpenLP.setSlide);
          li.find("*").attr("value", indexInt );
          ul.append(li);
        }
        OpenLP.currentItem = data.results.item;
        ul.listview("refresh");
      }
    );
  },
  setItem: function (event) {
    event.preventDefault();
    var item = OpenLP.getElement(event);
    var id = item.attr("value");
    if (typeof id !== "number") {
        id = "\"" + id + "\"";
    }
    var text = "{\"request\": {\"id\": " + id + "}}";
    $.getJSON(
      "/api/service/set",
      {"data": text},
      function (data, status) {
        $.mobile.changePage("#slide-controller");
        $("#service-manager > div[data-role=content] ul[data-role=listview] li").attr("data-theme", "c").removeClass("ui-btn-up-e").addClass("ui-btn-up-c");
        while (item[0].tagName != "LI") {
          item = item.parent();
        }
        item.attr("data-theme", "e").removeClass("ui-btn-up-c").addClass("ui-btn-up-e");
        $("#service-manager > div[data-role=content] ul[data-role=listview]").listview("refresh");
      }
    );
  },
  setSlide: function (event) {
    event.preventDefault();
    var slide = OpenLP.getElement(event);
    var id = slide.attr("value");
    if (typeof id !== "number") {
        id = "\"" + id + "\"";
    }
    var text = "{\"request\": {\"id\": " + id + "}}";
    $.getJSON(
      "/api/controller/live/set",
      {"data": text},
      function (data, status) {
        $("#slide-controller div[data-role=content] ul[data-role=listview] li").attr("data-theme", "c").removeClass("ui-btn-up-e").addClass("ui-btn-up-c");
        while (slide[0].tagName != "LI") {
          slide = slide.parent();
        }
        slide.attr("data-theme", "e").removeClass("ui-btn-up-c").addClass("ui-btn-up-e");
        $("#slide-controller div[data-role=content] ul[data-role=listview]").listview("refresh");
      }
    );
  },
  pollServer: function () {
    $.getJSON(
      "/api/poll",
      function (data, status) {
        var prevItem = OpenLP.currentItem;
        OpenLP.currentSlide = data.results.slide;
        OpenLP.currentItem = data.results.item;
        OpenLP.isSecure = data.results.isSecure;
        OpenLP.isAuthorised = data.results.isAuthorised;
        if ($("#service-manager").is(":visible")) {
          if (OpenLP.currentService != data.results.service) {
            OpenLP.currentService = data.results.service;
            OpenLP.loadService();
          }
          $("#service-manager div[data-role=content] ul[data-role=listview] li").attr("data-theme", "c").removeClass("ui-btn-up-e").addClass("ui-btn-up-c");
          $("#service-manager div[data-role=content] ul[data-role=listview] li a").each(function () {
            var item = $(this);
            while (item[0].tagName != "LI") {
              item = item.parent();
            }
            if (item.attr("uuid") == OpenLP.currentItem) {
              item.attr("data-theme", "e").removeClass("ui-btn-up-c").addClass("ui-btn-up-e");
              return false;
            }
          });
          $("#service-manager div[data-role=content] ul[data-role=listview]").listview("refresh");
        }
        if ($("#slide-controller").is(":visible")) {
          if (prevItem != OpenLP.currentItem) {
            OpenLP.loadController();
            return;
          }
          var idx = 0;
          $("#slide-controller div[data-role=content] ul[data-role=listview] li").attr("data-theme", "c").removeClass("ui-btn-up-e").addClass("ui-btn-up-c");
          $("#slide-controller div[data-role=content] ul[data-role=listview] li a").each(function () {
            var item = $(this);
            if (idx == OpenLP.currentSlide) {
              while (item[0].tagName != "LI") {
                item = item.parent();
              }
              item.attr("data-theme", "e").removeClass("ui-btn-up-c").addClass("ui-btn-up-e");
              return false;
            }
            idx++;
          });
          $("#slide-controller div[data-role=content] ul[data-role=listview]").listview("refresh");
        }
      }
    );
  },
  nextItem: function (event) {
    event.preventDefault();
    $.getJSON("/api/service/next");
  },
  previousItem: function (event) {
    event.preventDefault();
    $.getJSON("/api/service/previous");
  },
  nextSlide: function (event) {
    event.preventDefault();
    $.getJSON("/api/controller/live/next");
  },
  previousSlide: function (event) {
    event.preventDefault();
    $.getJSON("/api/controller/live/previous");
  },
  blankDisplay: function (event) {
    event.preventDefault();
    $.getJSON("/api/display/blank");
  },
  themeDisplay: function (event) {
    event.preventDefault();
    $.getJSON("/api/display/theme");
  },
  desktopDisplay: function (event) {
    event.preventDefault();
    $.getJSON("/api/display/desktop");
  },
  showDisplay: function (event) {
    event.preventDefault();
    $.getJSON("/api/display/show");
  },
  showAlert: function (event) {
    event.preventDefault();
    var alert = OpenLP.escapeString($("#alert-text").val())
    var text = "{\"request\": {\"text\": \"" + alert + "\"}}";
    $.getJSON(
      "/api/alert",
      {"data": text},
      function () {
        $("#alert-text").val("");
      }
    );
  },
  search: function (event) {
    event.preventDefault();
    var query = OpenLP.escapeString($("#search-text").val())
    var text = "{\"request\": {\"text\": \"" + query + "\"}}";
    $.getJSON(
      "/api/" + $("#search-plugin").val() + "/search",
      {"data": text},
      function (data, status) {
        var ul = $("#search > div[data-role=content] > ul[data-role=listview]");
        ul.html("");
        if (data.results.items.length == 0) {
          var li = $("<li data-icon=\"false\">").text(translationStrings["no_results"]);
          ul.append(li);
        }
        else {
            $.each(data.results.items, function (idx, value) {
              if (typeof value[0] !== "number"){
                value[0] = OpenLP.escapeString(value[0])
              }
              var txt = "";
              if (value.length > 2) {
                txt = value[1] + " ( " + value[2] + " )";
              } else {
                txt = value[1];
              }
              ul.append($("<li>").append($("<a>").attr("href", "#options")
                  .attr("data-rel", "dialog").attr("value", value[0])
                  .click(OpenLP.showOptions).text(txt)));
            });
        }
        ul.listview("refresh");
      }
    );
  },
  showOptions: function (event) {
    event.preventDefault();
    var element = OpenLP.getElement(event);
    $("#selected-item").val(element.attr("value"));
  },
  goLive: function (event) {
    event.preventDefault();
    var id = $("#selected-item").val();
    if (typeof id !== "number") {
      id = "\"" + id + "\"";
    }
    var text = "{\"request\": {\"id\": " + id + "}}";
    $.getJSON(
      "/api/" + $("#search-plugin").val() + "/live",
      {"data": text}
    );
    $.mobile.changePage("#slide-controller");
  },
  addToService: function (event) {
    event.preventDefault();
    var id = $("#selected-item").val();
    if (typeof id !== "number") {
        id = "\"" + id + "\"";
    }
    var text = "{\"request\": {\"id\": " + id + "}}";
    $.getJSON(
      "/api/" + $("#search-plugin").val() + "/add",
      {"data": text},
      function () {
        $("#options").dialog("close");
      }
    );
  },
  addAndGoToService: function (event) {
    event.preventDefault();
    var id = $("#selected-item").val();
    if (typeof id !== "number") {
        id = "\"" + id + "\"";
    }
    var text = "{\"request\": {\"id\": " + id + "}}";
    $.getJSON(
      "/api/" + $("#search-plugin").val() + "/add",
      {"data": text},
      function () {
        //$("#options").dialog("close");
        $.mobile.changePage("#service-manager");
      }
    );
  },
  escapeString: function (string) {
    return string.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")
  }
}
// Initial jQueryMobile options
$(document).bind("mobileinit", function(){
  $.mobile.defaultDialogTransition = "none";
  $.mobile.defaultPageTransition = "none";
});
// Service Manager
$("#service-manager").on("pagebeforeshow", OpenLP.loadService);
$("#service-refresh").on("click", OpenLP.loadService);
$("#service-next").on("click", OpenLP.nextItem);
$("#service-previous").on("click", OpenLP.previousItem);
$("#service-blank").on("click", OpenLP.blankDisplay);
$("#service-theme").on("click", OpenLP.themeDisplay);
$("#service-desktop").on("click", OpenLP.desktopDisplay);
$("#service-show").on("click", OpenLP.showDisplay);
// Slide Controller
$("#slide-controller").on("pagebeforeshow", OpenLP.loadController);
$("#controller-refresh").on("click", OpenLP.loadController);
$("#controller-next").on("click", OpenLP.nextSlide);
$("#controller-previous").on("click", OpenLP.previousSlide);
$("#controller-blank").on("click", OpenLP.blankDisplay);
$("#controller-theme").on("click", OpenLP.themeDisplay);
$("#controller-desktop").on("click", OpenLP.desktopDisplay);
$("#controller-show").on("click", OpenLP.showDisplay);
// Alerts
$("#alert-submit").on("click", OpenLP.showAlert);
// Search
$("#search-submit").on("click", OpenLP.search);
$("#search-text").on("keypress", function(event) {
    if (event.which == 13)
    {
        OpenLP.search(event);
    }
});
$("#go-live").on("click", OpenLP.goLive);
$("#add-to-service").on("click", OpenLP.addToService);
$("#add-and-go-to-service").on("click", OpenLP.addAndGoToService);
// Poll the server twice a second to get any updates.
$.ajaxSetup({cache: false});
console.log("hook");
$("#search").on("pageinit", function (event) {
  console.log("Page init!");
  OpenLP.getSearchablePlugins();
});
setInterval(OpenLP.pollServer, 500);
OpenLP.pollServer();
