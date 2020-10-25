# Place in /etc/systemd/system
arcade:
	rsync -av -e ssh ./arcade/ lightbike:/home/n0mn0m
	# sudo cp ./check-in* /etc/systemd/system
	# sudo systemctl daemon-reload
	# sudo systemctl enable check-in.service check-in.timer
	# sudo systemctl start check-in

jetson:
	rsync -av -e ssh ./jetson/ jetson:/home/nomnom

lightbike:
	rsync -av -e ssh ./lightbike/ lightbike:/home/n0mn0m

pihole:
	rsync -av -e ssh ./pihole/ c3:/home/pi

octo:
	rsync -av -e ssh ./octo/ octo:/home/pi

router:
	rsync -av -e ssh ./router/ router:/home/ubqadm
	# configure
	# set system task-scheduler task checkin
	# set system task-scheduler task checkin crontab-spec '*/5 * * * *'
	# set system task-scheduler task checkin executable path '/config/user-data/checkin.sh'
	# commit
	# save
	# cat /etc/cron.d/vyatta-crontab
