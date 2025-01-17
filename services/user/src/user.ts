import moment from 'moment';
import * as express from 'express';
import { Server } from 'http';

import { get, post, log } from '@shared/common';
import { IUserInfo } from '@shared/models';
import { UserDb } from '@shared/db';


export class User {
  public app: express.Application;
  private http!: Server;

  private users: any = {};
  private usersUrl: string = 'http://api/users/';
  private userDb: UserDb;


  constructor() {
    this.app = express.default().use(express.json());
    this.http = new Server(this.app);
    this.userDb = new UserDb();

    this.loadRoutes();
  }

  public start() {
    this.listen();
  }

  /**
   *
   */
  private loadRoutes() {
    // Get user by username
    this.app.get('/users/:username', async (req, res) => {
      log(
        'info',
        `route: /users/:username called with username: ${req.params.username}`
      );

      const payload: IUserInfo | undefined = await this.getUser(
        req.params.username
      );
      res.send(payload);
    });

    this.app.get('/update/:username/:force', async (req, res) => {
      log(
        'info',
        `route: /update/:username called with username: ${req.params.username}`
      );

      const forceUpdate: boolean = req.params.force !== undefined ? req.params.force : false;

      const payload: IUserInfo | undefined = await this.updateUser(
        req.params.username,
        forceUpdate
      );
      res.send(payload);
    });

    this.app.post('/livecoders', async (req, res) => {
      if (!req.body) {
        log(
          'info',
          `route: /livecoders called with empty payload. Aborting...`
        )
        return;
      }
      log(
        'info',
        `route: /livecoders ${JSON.stringify(req.body)}`
      )
      this.liveCodersUpdates(req.body);
    });
  }

  private liveCodersUpdates = async(
    usernames: string[]
  ): Promise<void> => {
    const url = `${this.usersUrl}`;
    const users = await post(url, usernames) as IUserInfo[];
    users.forEach(async user => {
      user.liveCodersTeamMember = true;
      const savedUser = await this.userDb.saveUserInfo(user);
      if (savedUser) {
        this.users[savedUser.login] = savedUser;
      }
    });
  }

  private getUser = async (
    username: string
  ): Promise<IUserInfo | undefined> => {
    if (username == null) {
      return undefined;
    }

    username = username.toLocaleLowerCase();

    let user = this.users[username];

    if (user) {
      log('info', `Retrieved from cache: ${username}`);
      return user;
    }

    user = await this.userDb.getUserInfo(username);

    if (user) {
      log('info', `Retrieved from db: ${username}`);
      this.users[username] = user;
      return user;
    }

    const url = `${this.usersUrl}${username}`;

    user = await get(url);

    user = await this.userDb.saveUserInfo(user);

    log('info', `Retrieved from api: ${username}`);

    this.users[user.login] = user;
    return user;
  };

  private updateUser = async (
    username: string,
    forceUpdate: boolean
  ): Promise<IUserInfo | undefined> => {
    if (username == null) {
      return undefined;
    }

    username = username.toLocaleLowerCase();

    const existingUser: IUserInfo | undefined = await this.getUser(username);

    if (!forceUpdate &&
        existingUser &&
        existingUser.lastUpdated) {
        const refreshIfBefore: moment.Moment = moment(new Date().setDate(new Date().getDate() -1));
        const lastUpdated: moment.Moment = moment(new Date(existingUser.lastUpdated));
        if (!lastUpdated.isBefore(refreshIfBefore)) {
          return existingUser;
        }
    }

    const url = `${this.usersUrl}${username}`;

    let user: any = await get(url);

    /* set lastUpdated so we don't try and update them again within 24 hours */
    user.lastUpdated = new Date().toISOString();

    user = await this.userDb.saveUserInfo(user);

    //Provide some error handling
    if (user)
    {
      this.users[user.login] = user;
      log('info', `Updated ${username} from api`);
    } else if (existingUser) {
      user = this.users[existingUser.login];
      log('error', `Error while updating ${username} in DB`);
    }

    return user;
  };


  /**
   * Start the Node.js server
   */
  private listen = (): void => {
    this.http.listen(80, () => {
      log('info', 'listening on *:80');
    });
  };
}
