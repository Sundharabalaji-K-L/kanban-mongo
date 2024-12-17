import React from 'react';
import { Route, Switch } from 'react-router-dom';
import KanbanBoard from './components/KanbanBoard';
import AdminKanban from './components/AdminKanban';

const AppRoutes: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/" component={KanbanBoard} />
      <Route path="/admin" component={AdminKanban} />
    </Switch>
  );
};

export default AppRoutes;