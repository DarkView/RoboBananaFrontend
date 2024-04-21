import { Component, OnInit } from '@angular/core';
import { BotConnectorService } from '../services/bot-connector.service';
import { InhouseTrackerService } from '../services/inhouse-tracker.service';
import { getBaseStreamURL } from '../utility';
import { trigger, transition, style, animate } from '@angular/animations';
import { ActivatedRoute } from '@angular/router';

enum Colors {
  ATTACKER_REG = "rgba(232, 130, 125, 0.75)",
  ATTACKER_FEINT = "rgba(232, 130, 125, 0.35)",
  DEFENDER_REG = "rgba(125, 232, 187, 0.75)",
  DEFENDER_FEINT = "rgba(125, 232, 187, 0.35)",
}

@Component({
  selector: 'app-inhouse-tracker',
  templateUrl: './inhouse-tracker.component.html',
  styleUrls: ['./inhouse-tracker.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [
        style({ 'opacity': '0' }),
        animate('0.5s', style({ 'opacity': '1' }))
      ]),

      transition(':leave',
        animate('0.5s', style({ 'opacity': '0' }))
      )
    ])
  ]
})
export class InhouseTrackerComponent implements OnInit {

  activelyTracking: boolean = false;
  currentTrackId: string | null = null;
  match: any = null;
  teamLeft: any = null;
  teamRight: any = null;

  ranksEnabled: boolean = false;
  ranksByName: any = {};

  teamLeftColor: string = Colors.ATTACKER_REG;
  teamLeftColorFeint: string = Colors.ATTACKER_FEINT;
  teamRightColor: string = Colors.DEFENDER_REG;
  teamRightColorFeint: string = Colors.DEFENDER_FEINT;

  constructor(private botService: BotConnectorService, private inhouseTrackerService: InhouseTrackerService, private route: ActivatedRoute) {
      this.route.queryParams.subscribe(params => {
        this.ranksEnabled = params["ranks"] == "true" ? true : false;
      });
  }

  async ngOnInit(): Promise<void> {
    this.match = null;
    this.botService.getStream("streamdeck").subscribe(async data => {
      if (data.type === "inhouse-tracker") {
        if (data.name === "trackState" && data.value == true) {
          if (data.id) {
            this.currentTrackId = data.id;
            this.activelyTracking = true;
          }
        } else if (data.name === "trackState" && data.value == false) {
          this.resetTracker();
          this.activelyTracking = false;
        }
      }
    });

    const streamURL = getBaseStreamURL() + "?channel=inhouse-tracker-channel";
    const source = new EventSource(streamURL);

    source.addEventListener("inhouse-tracker-data", (e: MessageEvent) => {
      this.updateMatch(JSON.parse(e.data));
      this.activelyTracking = true;
    })

    if (this.ranksEnabled) {
      this.ranksByName = this.inhouseTrackerService.getRanksFromSheet();
    }
  }

  updateMatch(data: any) {
    this.match = data;
    this.teamLeft = this.match.teams[0];
    this.teamRight = this.match.teams[1];

    this.teamLeft.teamName = "TIRA";
    this.teamRight.teamName = "DNKL";
    this.teamLeftColor = this.teamLeft.isAttacking ? Colors.ATTACKER_REG : Colors.DEFENDER_REG;
    this.teamLeftColorFeint = this.teamLeft.isAttacking ? Colors.ATTACKER_FEINT : Colors.DEFENDER_FEINT;
    this.teamRightColor = this.teamRight.isAttacking ? Colors.ATTACKER_REG : Colors.DEFENDER_REG;
    this.teamRightColorFeint = this.teamRight.isAttacking ? Colors.ATTACKER_FEINT : Colors.DEFENDER_FEINT;
  }

  resetTracker() {
    if (!this.activelyTracking) return;
    this.currentTrackId = null;
  }

  numSequence(n: number): Array<number> {
    return Array(n);
  }
}
