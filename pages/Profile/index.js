import React, { useEffect, useState } from 'react';
import {
	View,
	ScrollView,
	Text,
	RefreshControl,
	Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import styles from '../../style';
import { get } from '../../services/api';
import { Avatar } from 'react-native-elements';
import { BarChart, Grid, YAxis } from 'react-native-svg-charts';
import * as scale from 'd3-scale';
import { Text as SVGText } from 'react-native-svg';

import { getUser } from '../../utils';

export default function ProfileScreen(props) {
	const [user, setUser] = useState(null);
	const [username, setUsername] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [profile, setProfile] = useState(null);
	const [scores, setScores] = useState(null);
	const [data, setData] = useState(null);

	const { reset } = props.navigation;

	useEffect(() => {
		setLoading(true);
		getLocalUser();
		setLoading(false);
	}, []);

	async function getLocalUser() {
		const { user, username } = await getUser(reset, true);
		setUser(user);
		setUsername(username);
	}

	useEffect(() => {
		if (user) {
			getUserProfile();
		}
	}, [user]);

	async function getUserProfile() {
		setLoading(true);
		get('/auth/user/', {
			user:
				props.route &&
				props.route.params &&
				props.route.params.user !== null
					? props.route.params.user
					: user,
		})
			.then((response) => {
				setProfile(response.data.temp_user);
				setLoading(false);
			})
			.catch((error) => {
				setLoading(false);
				setError(
					'Ocorreu um erro. Por favor, tente novamente mais tarde.'
				);
			});
	}

	useEffect(() => {
		if (profile !== null) {
			get('/game/scoreboards/scores', {
				user:
					props.route &&
					props.route.params &&
					props.route.params.user !== null
						? props.route.params.user
						: user,
			})
				.then((response) => {
					setScores(response.data);
					setLoading(false);
				})
				.catch((error) => {
					setLoading(false);
					setError(
						'Ocorreu um erro. Por favor, tente novamente mais tarde.'
					);
				});
		}
	}, [profile]);

	async function onRefresh() {
		getUserProfile();
	}

	useEffect(() => {
		if (scores) {
			setData([
				{ label: 'Round 1', value: scores.rb_at_1 },
				{ label: 'Round 2', value: scores.rb_at_2 },
				{ label: 'Round 3', value: scores.rb_at_3 },
				{ label: 'Round 4', value: scores.rb_at_4 },
				{ label: 'Round 5', value: scores.rb_at_5 },
				{ label: 'Round 6', value: scores.rb_at_6 },
				{ label: 'Round 7', value: scores.rb_at_7 },
				{ label: 'Round 8', value: scores.rb_at_8 },
				{ label: 'Round 9', value: scores.rb_at_9 },
				{
					label: 'Round 10',
					value: scores.rb_at_10,
				},
			]);
		}
	}, [scores]);

	const Labels = ({ x, y, bandwidth, data }) =>
		data.map((value, index) => (
			<SVGText
				key={index}
				x={x(value.value) + 10}
				y={y(index) + bandwidth / 2}
				fontSize={14}
				fill={'#f1f1f1'}
				alignmentBaseline={'middle'}>
				{value.value}
			</SVGText>
		));

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: '#212121' }}>
			<ScrollView
				contentContainerStyle={{ flexGrow: 1 }}
				refreshControl={
					<RefreshControl
						refreshing={loading}
						onRefresh={onRefresh}
					/>
				}>
				{profile && (
					<View
						style={[
							styles.row,
							{
								justifyContent: 'center',
								margin: 10,
								flexWrap: 'wrap',
							},
						]}>
						{/* <Icon
						name='spinner'
						color={'#f1f1f1'}
						type='font-awesome'
						size={18}
						iconStyle={{
							margin: 10,
						}}
					/>
					<Text style={{ color: '#f1f1f1', fontSize: 30 }}>
						Coming soon...
					</Text> */}
						{profile.photo && (
							<Avatar
								rounded
								size='large'
								source={{ uri: profile.photo }}
							/>
						)}
						<View
							style={{
								margin: 10,
								justifyContent: 'center',
								alignItems: 'center',
							}}>
							<Text style={{ color: '#f1f1f1', fontSize: 20 }}>
								{profile.name}
							</Text>
							<Text
								style={{
									color: '#f1f1f180',
									fontSize: 15,
									textAlign: 'justify',
								}}>
								{profile.email}
							</Text>
						</View>
					</View>
				)}
				{scores && (
					<View>
						<View style={[styles.row, { marginTop: 20 }]}>
							<Text style={{ fontSize: 18, color: '#f1f1f1' }}>
								Points: {scores.points}
							</Text>
						</View>
						<View style={styles.row}>
							<Text style={{ fontSize: 18, color: '#f1f1f1' }}>
								Games: {scores.games}
							</Text>
						</View>
						<View style={styles.row}>
							<Text style={{ fontSize: 18, color: '#f1f1f1' }}>
								Wins: {scores.wins}
							</Text>
						</View>
						<View style={styles.row}>
							<Text style={{ fontSize: 18, color: '#f1f1f1' }}>
								Max score: {scores.max_score}
							</Text>
						</View>
						<View style={styles.row}>
							<Text style={{ fontSize: 18, color: '#f1f1f1' }}>
								Entry plays: {scores.entry_plays}
							</Text>
						</View>
						<View style={styles.row}>
							<Text style={{ fontSize: 18, color: '#f1f1f1' }}>
								Entry wins:{' '}
								{(
									(scores.entry_wins / scores.entry_plays) *
									100
								).toFixed(1)}
								%
							</Text>
						</View>
						<View
							style={[
								styles.row,
								{ justifyContent: 'flex-start' },
							]}>
							<Text style={{ fontSize: 18, color: '#f1f1f1' }}>
								Right bets:{' '}
								{(
									(scores.right_bets / (scores.games * 10)) *
									100
								).toFixed(1)}
								%{' '}
							</Text>
							<Text style={{ fontSize: 15, color: '#f1f1f180' }}>
								(Zero bets:{' '}
								{(
									(scores.right_bets_zero /
										(scores.games * 10)) *
									100
								).toFixed(1)}
								%)
							</Text>
						</View>
						{data && (
							<View style={{ marginTop: 20 }}>
								<View
									style={[
										styles.row,
										{ justifyContent: 'center' },
									]}>
									<Text
										style={{
											fontSize: 18,
											color: '#f1f1f1',
										}}>
										Right bets by round
									</Text>
								</View>
								<View
									style={[
										styles.row,
										{
											flexDirection: 'row',
											height: 300,
											width: Dimensions.get('window')
												.width,
										},
									]}>
									<YAxis
										data={data}
										yAccessor={({ index }) => index}
										scale={scale.scaleBand}
										contentInset={{ top: 10, bottom: 10 }}
										spacing={0.2}
										svg={{
											fill: '#f1f1f1',
										}}
										formatLabel={(_, index) =>
											data[index].label
										}
									/>
									<BarChart
										style={{ marginLeft: 8, flex: 1 }}
										horizontal
										data={data}
										svg={{ fill: '#27496d' }}
										yMin={0}
										yMax={scores.games + 1}
										yAccessor={({ item }) => item.value}
										contentInset={{
											top: 10,
											bottom: 10,
										}}
										spacing={0.2}>
										<Labels />
									</BarChart>
								</View>
							</View>
						)}
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}
