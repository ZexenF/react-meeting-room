import React, { Component } from "react";
import moment from "moment";
import 'moment/locale/fr';
import welcomeImage from "../images/welcome.svg";
import spinner from "../images/spinner.svg";
import { GOOGLE_API_KEY, CALENDAR_ID } from "../config.js";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: dayjs().format("dddd, D MMMM YYYY, HH:mm"),
      events: [],
      isBusy: false,
      isEmpty: false,
      isLoading: true
    };
  }

  componentDidMount = () => {
    this.getEvents();
    setInterval(() => {
      this.tick();
    }, 1000);
    setInterval(() => {
      this.getEvents();
    }, 60000);
  };

  getEvents() {
    let that = this;
    function start() {
      gapi.client
        .init({
          apiKey: GOOGLE_API_KEY
        })
        .then(function() {
          return gapi.client.request({
            path: `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?maxResults=11&orderBy=updated&timeMin=${dayjs().toISOString()}&timeMax=${dayjs()
              .endOf("day")
              .toISOString()}`
          });
        })
        .then(
          response => {
            let events = response.result.items;
            let sortedEvents = events.sort(function(a, b) {
              return (
                dayjs(b.start.dateTime).format("YYYYMMDD") -
                dayjs(a.start.dateTime).format("YYYYMMDD")
              );
            });
            if (events.length > 0) {
              that.setState(
                {
                  events: sortedEvents,
                  isLoading: false,
                  isEmpty: false
                },
                () => {
                  that.setStatus();
                }
              );
            } else {
              that.setState({
                isBusy: false,
                isEmpty: true,
                isLoading: false
              });
            }
          },
          function(reason) {
            console.log(reason);
          }
        );
    }
    gapi.load("client", start);
  }

  tick = () => {
    let time = dayjs().format("dddd, D MMMM YYYY, HH:mm");
    this.setState({
      time: time
    });
  };

  setStatus = () => {
    let now = dayjs();
    let events = this.state.events;
    for (var e = 0; e < events.length; e++) {
      var eventItem = events[e];
      if (
        dayjs(now).isBetween(
          dayjs(eventItem.start.dateTime),
          dayjs(eventItem.end.dateTime)
        )
      ) {
        this.setState({
          isBusy: true
        });
        return false;
      } else {
        this.setState({
          isBusy: false
        });
      }
    }
  };

  render() {
    const { time, events } = this.state;

    let eventsList = events.map(function(event) {
      return (
        <a
          className="list-group-item"
          href={event.htmlLink}
          target="_blank"
          key={event.id}
        >
          {event.summary}{" "}
          <span className="badge">
            {dayjs(event.start.dateTime).format("HH:mm")},{" "}
            {dayjs(event.end.dateTime).diff(
              dayjs(event.start.dateTime),
              "minutes"

            )}{" "}
            minutes, {dayjs(event.start.dateTime).format("D MMMM YYYY")}{" "}
          </span>
        </a>
      );
    });

    let emptyState = (
      <div className="empty">
        <img src={welcomeImage} alt="Welcome" />
        <h3>

        </h3>
      </div>
    );

    let loadingState = (
      <div className="loading">
        <img src={spinner} alt="Loading..." />
      </div>
    );

    return (
      <div className="container">
        <div
          className={
            this.state.isBusy ? "current-status busy" : "current-status open"
          }
        >
          <h1>{this.state.isBusy ? "ROOM OCCUPE" : "ROOM LIBRE"}</h1>
        </div>
        <div className="upcoming-meetings">
          <div className="current-time">{time}</div>
          <h1>Réservations</h1>
          <div className="list-group">
            {this.state.isLoading && loadingState}
            {events.length > 0 && eventsList}
            {this.state.isEmpty && emptyState}
          </div>
          <a
//            className="primary-cta"
//            href="https://calendar.google.com/calendar?cid=c3FtMnVkaTFhZGY2ZHM3Z2o5aDgxdHVldDhAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ"
//            target="_blank"
          >

          </a>
        </div>
      </div>
    );
  }
}
